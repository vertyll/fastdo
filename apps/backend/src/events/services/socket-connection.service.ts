import { Injectable, Logger } from '@nestjs/common';

interface CustomSocket {
  id: string;
  userId?: number;
  email?: string;
  join: (room: string) => void;
  leave: (room: string) => void;
  emit: (event: string, data: any) => void;
  disconnect: () => void;
}

@Injectable()
export class SocketConnectionService {
  private readonly logger = new Logger(SocketConnectionService.name);
  private readonly userConnections = new Map<number, Set<CustomSocket>>();

  public addConnection(userId: number, socket: CustomSocket): void {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }

    this.userConnections.get(userId)!.add(socket);
    this.logger.log(`User ${userId} connected with socket ${socket.id}`);
  }

  public removeConnection(userId: number, socketId: string): void {
    const userSockets = this.userConnections.get(userId);
    if (userSockets) {
      const socketToRemove = Array.from(userSockets).find(s => s.id === socketId);
      if (socketToRemove) {
        userSockets.delete(socketToRemove);
        this.logger.log(`User ${userId} disconnected socket ${socketId}`);

        if (userSockets.size === 0) {
          this.userConnections.delete(userId);
        }
      }
    }
  }

  public getUserSockets(userId: number): CustomSocket[] {
    const userSockets = this.userConnections.get(userId);
    return userSockets ? Array.from(userSockets) : [];
  }

  public getAllConnectedUsers(): number[] {
    return Array.from(this.userConnections.keys());
  }

  public getConnectionsCount(): number {
    let totalConnections = 0;
    this.userConnections.forEach(sockets => {
      totalConnections += sockets.size;
    });
    return totalConnections;
  }

  public getUserConnectionsCount(userId: number): number {
    const userSockets = this.userConnections.get(userId);
    return userSockets ? userSockets.size : 0;
  }
}
