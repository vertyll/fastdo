import { Injectable, effect, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/data-access/auth.service';
import { AuthStateService } from '../../auth/data-access/auth.state.service';
import { NotificationWsEvent, NotificationWsEventType } from '../defs/notification.defs';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface TokenAwareSocket extends Socket {
  _currentToken?: string;
}

const SOCKET_OPTIONS = {
  transports: ['websocket', 'polling'] as string[],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  forceNew: true,
};

const AUTH_ERROR_KEYWORDS = ['Authentication', 'Invalid', 'Unauthorized'];

@Injectable({
  providedIn: 'root',
})
export class NotificationWebSocketService {
  private readonly authService = inject(AuthService);
  private readonly authStateService = inject(AuthStateService);

  private socket: TokenAwareSocket | null = null;
  private readonly connectionStatus = signal<ConnectionStatus>('disconnected');
  private readonly connectionSubject = new BehaviorSubject<boolean>(false);
  private readonly eventsSubject = new Subject<NotificationWsEvent>();

  public readonly connectionStatus$ = this.connectionStatus.asReadonly();
  public readonly isConnected$ = this.connectionSubject.asObservable();
  public readonly events$ = this.eventsSubject.asObservable();

  constructor() {
    effect(() => this.handleAuthConnectionChange());
    effect(() => this.handleTokenSync());
  }

  public connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const token = this.authStateService.getToken();
    if (!token) {
      return;
    }

    this.connectionStatus.set('connecting');
    this.socket = this.createSocket(token);
    this.setupEventListeners();
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.markDisconnected();
  }

  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  public emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event);
    }
  }

  public on(event: string): Observable<any> {
    return new Observable(observer => {
      if (!this.socket) {
        observer.error('WebSocket not connected');
        return;
      }

      this.socket.on(event, data => observer.next(data));

      return () => {
        this.socket?.off(event);
      };
    });
  }

  public reconnect(): void {
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  public updateToken(newToken: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket._currentToken = newToken;
    this.socket.emit('update_auth', { token: `Bearer ${newToken}` });

    setTimeout(() => {
      if (this.socket?._currentToken === newToken) {
        this.reconnectWithNewToken();
      }
    }, 1000);
  }

  private handleAuthConnectionChange(): void {
    const isLoggedIn = this.authStateService.isLoggedIn();
    const token = this.authStateService.getToken();

    if (isLoggedIn && token) {
      this.connect();
    } else {
      this.disconnect();
    }
  }

  private handleTokenSync(): void {
    const token = this.authStateService.getToken();
    const isLoggedIn = this.authStateService.isLoggedIn();

    if (isLoggedIn && token && this.socket?.connected) {
      const currentSocketToken = this.socket._currentToken;
      if (currentSocketToken && currentSocketToken !== token) {
        this.reconnectWithNewToken();
      }
    }
  }

  private createSocket(token: string): TokenAwareSocket {
    const socket = io(`${environment.backendUrl}/notifications`, {
      query: {
        token,
        auth: `Bearer ${token}`,
      },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      ...SOCKET_OPTIONS,
    }) as TokenAwareSocket;

    socket._currentToken = token;
    return socket;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => this.markConnected());
    this.socket.on('disconnect', () => this.markDisconnected());

    this.socket.on('connect_error', error => {
      console.error('WebSocket connection error:', error);
      this.markDisconnected();
      if (this.isAuthErrorMessage(error?.message)) {
        this.handleAuthError();
      }
    });

    this.socket.on('connection_error', data => {
      console.error('Server connection error:', data);
      this.markDisconnected();
      if (this.isAuthErrorMessage(data?.message)) {
        this.handleAuthError();
      } else {
        this.disconnect();
      }
    });

    this.socket.on('token_expired', () => this.handleAuthError());
    this.socket.on('token_warning', () => this.handleAuthError());

    this.socket.on('update_auth_response', data => {
      if (!data?.success) {
        console.warn('WebSocket auth update failed:', data?.message);
        this.handleAuthError();
      }
    });

    this.socket.on('notification.created', () => this.emitEvent('notification-refresh'));
    this.socket.on('notification.read', data => this.emitEvent('notification-refresh', data));
    this.socket.on('notification.updated', () => this.emitEvent('notification-refresh'));
  }

  private markConnected(): void {
    this.connectionStatus.set('connected');
    this.connectionSubject.next(true);
    this.emitEvent('connected');
  }

  private markDisconnected(): void {
    this.connectionStatus.set('disconnected');
    this.connectionSubject.next(false);
    this.emitEvent('disconnected');
  }

  private isAuthErrorMessage(message?: string): boolean {
    if (!message) return false;
    return AUTH_ERROR_KEYWORDS.some(keyword => message.includes(keyword));
  }

  private reconnectWithNewToken(): void {
    this.disconnect();
    setTimeout(() => this.connect(), 500);
  }

  private handleAuthError(): void {
    if (this.authService.isTokenValid()) {
      setTimeout(() => this.reconnectWithNewToken(), 1000);
      return;
    }

    this.authService.refreshToken().subscribe({
      next: () => {
        setTimeout(() => this.reconnectWithNewToken(), 500);
      },
      error: err => {
        console.error('Token refresh failed:', err);
        this.disconnect();
      },
    });
  }

  private emitEvent(type: NotificationWsEventType, payload?: NotificationWsEvent['payload']): void {
    this.eventsSubject.next({ type, payload });
  }
}
