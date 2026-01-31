import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { WebSocketEventEnum } from '../enums/websocket-event.enum';
import { WebSocketResponseEnum } from '../enums/websocket-response.enum';
import { SocketConnectionService } from '../services/socket-connection.service';
import { AuthenticatedSocket, SocketServer } from '../types/socket.interface';

@WebSocketGateway({
  cors: {
    origin: process.env.WEBSOCKET_CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:4200',
    methods: process.env.WEBSOCKET_METHODS?.split(',') || ['GET', 'POST'],
    credentials: true,
  },
  transports: process.env.WEBSOCKET_TRANSPORTS?.split(',') || ['websocket', 'polling'],
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: SocketServer;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly socketConnectionService: SocketConnectionService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(_server: SocketServer): void {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = this.extractTokenFromClient(client);
      const clientIp =
        client.handshake.headers['x-forwarded-for'] || client.handshake.headers['x-real-ip'] || 'unknown';

      if (!token) {
        this.logger.warn(`Connection rejected from ${clientIp}: No token provided`);
        client.emit(WebSocketResponseEnum.CONNECTION_ERROR, { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      let payload;
      try {
        payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('app.security.jwt.accessToken.secret'),
        });
      } catch (jwtError) {
        this.logger.warn(`Connection rejected from ${clientIp}: Invalid token - ${jwtError.message}`);
        client.emit(WebSocketResponseEnum.CONNECTION_ERROR, { message: 'Invalid authentication token' });
        client.disconnect();
        return;
      }

      if (!payload?.sub) {
        this.logger.warn(`Connection rejected from ${clientIp}: Invalid token payload`);
        client.emit(WebSocketResponseEnum.CONNECTION_ERROR, { message: 'Invalid token payload' });
        client.disconnect();
        return;
      }

      (client as any).userId = payload.sub;
      (client as any).email = payload.email;

      this.socketConnectionService.addConnection(payload.sub, client);

      client.join(`user_${payload.sub}`);

      this.logger.log(`User ${payload.sub} (${payload.email}) connected from ${clientIp}`);

      client.emit(WebSocketResponseEnum.CONNECTED, {
        message: 'Successfully connected to notifications',
        userId: payload.sub,
      });

      this.setupTokenExpirationCheck(client, payload);
    } catch (error) {
      this.logger.error('Error during connection:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    if ((client as any).userId) {
      this.socketConnectionService.removeConnection((client as any).userId, client.id);
      this.logger.log(`User ${(client as any).userId} disconnected`);
    }
  }

  @SubscribeMessage(WebSocketEventEnum.JOIN_ROOM)
  handleJoinRoom(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { room: string }): WsResponse {
    if (!(client as any).userId) {
      return { event: WebSocketResponseEnum.JOIN_ROOM_RESPONSE, data: { success: false, message: 'Unauthorized' } };
    }

    client.join(data.room);
    this.logger.log(`User ${(client as any).userId} joined room: ${data.room}`);

    return {
      event: WebSocketResponseEnum.JOIN_ROOM_RESPONSE,
      data: { success: true, message: `Joined room: ${data.room}` },
    };
  }

  @SubscribeMessage(WebSocketEventEnum.LEAVE_ROOM)
  handleLeaveRoom(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { room: string }): WsResponse {
    if (!(client as any).userId) {
      return { event: WebSocketResponseEnum.LEAVE_ROOM_RESPONSE, data: { success: false, message: 'Unauthorized' } };
    }

    client.leave(data.room);
    this.logger.log(`User ${(client as any).userId} left room: ${data.room}`);

    return {
      event: WebSocketResponseEnum.LEAVE_ROOM_RESPONSE,
      data: { success: true, message: `Left room: ${data.room}` },
    };
  }

  @SubscribeMessage(WebSocketEventEnum.MARK_NOTIFICATION_READ)
  handleMarkNotificationRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: number },
  ): WsResponse {
    if (!(client as any).userId) {
      return {
        event: WebSocketResponseEnum.MARK_NOTIFICATION_READ_RESPONSE,
        data: { success: false, message: 'Unauthorized' },
      };
    }

    this.logger.log(`User ${(client as any).userId} marked notification ${data.notificationId} as read`);

    return {
      event: WebSocketResponseEnum.MARK_NOTIFICATION_READ_RESPONSE,
      data: { success: true, message: 'Notification marked as read' },
    };
  }

  @SubscribeMessage(WebSocketEventEnum.UPDATE_AUTH)
  async handleUpdateAuth(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { token: string },
  ): Promise<WsResponse> {
    try {
      const token = data.token?.startsWith('Bearer ') ? data.token.substring(7) : data.token;

      if (!token) {
        return {
          event: WebSocketResponseEnum.UPDATE_AUTH_RESPONSE,
          data: { success: false, message: 'No token provided' },
        };
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('app.security.jwt.accessToken.secret'),
      });

      if (!payload?.sub) {
        return {
          event: WebSocketResponseEnum.UPDATE_AUTH_RESPONSE,
          data: { success: false, message: 'Invalid token' },
        };
      }

      (client as any).userId = payload.sub;
      (client as any).email = payload.email;

      this.logger.log(`User ${payload.sub} updated auth token`);

      return {
        event: WebSocketResponseEnum.UPDATE_AUTH_RESPONSE,
        data: { success: true, message: 'Token updated successfully' },
      };
    } catch (error) {
      this.logger.error('Error updating auth token:', error);
      return {
        event: WebSocketResponseEnum.UPDATE_AUTH_RESPONSE,
        data: { success: false, message: 'Token update failed' },
      };
    }
  }

  emitToUser(userId: number, event: string, data: any): void {
    const room = `user_${userId}`;
    this.server.to(room).emit(event, data);
    this.logger.debug(`Emitted '${event}' to user ${userId}`);
  }

  emitToRoom(room: string, event: string, data: any): void {
    this.server.to(room).emit(event, data);
    this.logger.debug(`Emitted '${event}' to room '${room}'`);
  }

  private extractTokenFromClient(client: AuthenticatedSocket): string | null {
    const authToken = (client as any).handshake?.auth?.token;
    if (typeof authToken === 'string') {
      return authToken.startsWith('Bearer ') ? authToken.substring(7) : authToken;
    }

    const authHeader = client.handshake.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const tokenFromQuery = client.handshake.query.token;
    if (typeof tokenFromQuery === 'string') {
      return tokenFromQuery;
    }

    const authFromQuery = client.handshake.query.auth;
    if (typeof authFromQuery === 'string') {
      return authFromQuery;
    }

    return null;
  }

  private setupTokenExpirationCheck(client: AuthenticatedSocket, payload: any): void {
    if (!payload.exp) return;

    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    const warningTime = Math.max(0, timeUntilExpiration - 5 * 60 * 1000); // 5 minutes before expiration

    if (warningTime > 0) {
      setTimeout(() => {
        if (client.connected) {
          client.emit(WebSocketResponseEnum.TOKEN_WARNING, {
            message: 'Token will expire soon, please refresh',
            expiresIn: 5 * 60 * 1000, // 5 minutes
          });
        }
      }, warningTime);
    }

    if (timeUntilExpiration > 0) {
      setTimeout(() => {
        if (client.connected) {
          this.logger.warn(`Disconnecting user ${payload.sub} due to token expiration`);
          client.emit(WebSocketResponseEnum.TOKEN_EXPIRED, { message: 'Token expired' });
          client.disconnect();
        }
      }, timeUntilExpiration);
    }
  }
}
