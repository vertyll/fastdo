import { Injectable, effect, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/data-access/auth.service';
import { AuthStateService } from '../../auth/data-access/auth.state.service';

export interface NotificationEvent {
  type: 'notification.created' | 'notification.read' | 'notification.updated';
  data: any;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationWebSocketService {
  private authService = inject(AuthService);
  private authStateService = inject(AuthStateService);

  private socket: Socket | null = null;
  private connectionStatus = signal<'disconnected' | 'connecting' | 'connected'>('disconnected');
  private connectionSubject = new BehaviorSubject<boolean>(false);

  readonly connectionStatus$ = this.connectionStatus.asReadonly();
  readonly isConnected$ = this.connectionSubject.asObservable();

  constructor() {
    effect(() => {
      const isLoggedIn = this.authStateService.isLoggedIn();
      const token = this.authStateService.getToken();

      // console.log('WebSocket auth effect:', { isLoggedIn, hasToken: !!token });

      if (isLoggedIn && token) {
        // console.log('Attempting WebSocket connection...');
        this.connect();
      } else {
        // console.log('Disconnecting WebSocket - no auth');
        this.disconnect();
      }
    });

    effect(() => {
      const token = this.authStateService.getToken();
      const isLoggedIn = this.authStateService.isLoggedIn();

      if (isLoggedIn && token && this.socket?.connected) {
        const currentSocketToken = (this.socket as any)._currentToken;
        if (currentSocketToken && currentSocketToken !== token) {
          // console.log('Token refreshed, reconnecting WebSocket...');
          this.reconnectWithNewToken();
        }
      }
    });
  }

  public connect(): void {
    if (this.socket?.connected) {
      // console.log('WebSocket already connected');
      return;
    }

    const token = this.authStateService.getToken();
    // console.log('WebSocket connect - token available:', !!token);

    if (!token) {
      // console.warn('No access token available for WebSocket connection');
      return;
    }

    // console.log('Creating WebSocket connection with token...');
    this.connectionStatus.set('connecting');

    this.socket = io(`${environment.backendUrl}/notifications`, {
      query: {
        token: token,
        auth: `Bearer ${token}`,
      },
      extraHeaders: {
        'Authorization': `Bearer ${token}`,
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000, // 10 seconds timeout
      forceNew: true, // Always create a new connection
    });

    // Store current token for comparison
    (this.socket as any)._currentToken = token;

    this.setupEventListeners();
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionStatus.set('disconnected');
    this.connectionSubject.next(false);
    this.emitWebSocketEvent('websocket-disconnected');
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

      this.socket.on(event, data => {
        observer.next(data);
      });

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
    if (this.socket?.connected) {
      // Store new token
      (this.socket as any)._currentToken = newToken;

      // Emit token update to server (if supported by backend)
      this.socket.emit('update_auth', { token: `Bearer ${newToken}` });

      // If server doesn't support token update, reconnect
      setTimeout(() => {
        if (this.socket && (this.socket as any)._currentToken === newToken) {
          this.reconnectWithNewToken();
        }
      }, 1000);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      // console.log('WebSocket connected');
      this.connectionStatus.set('connected');
      this.connectionSubject.next(true);
      this.emitWebSocketEvent('websocket-connected');
    });

    this.socket.on('disconnect', reason => {
      // console.log('WebSocket disconnected:', reason);
      this.connectionStatus.set('disconnected');
      this.connectionSubject.next(false);
      this.emitWebSocketEvent('websocket-disconnected');
    });

    this.socket.on('connect_error', error => {
      console.error('WebSocket connection error:', error);
      this.connectionStatus.set('disconnected');
      this.connectionSubject.next(false);
      this.emitWebSocketEvent('websocket-disconnected');

      if (
        error.message?.includes('Authentication') || error.message?.includes('Invalid')
        || error.message?.includes('Unauthorized')
      ) {
        this.handleAuthError();
      }
    });

    this.socket.on('connection_error', data => {
      console.error('Server connection error:', data);
      this.connectionStatus.set('disconnected');
      this.connectionSubject.next(false);
      this.emitWebSocketEvent('websocket-disconnected');

      if (data.message?.includes('Authentication') || data.message?.includes('Invalid')) {
        this.handleAuthError();
      } else {
        this.disconnect();
      }
    });

    this.socket.on('token_expired', () => {
      // console.log('WebSocket token expired, refreshing...');
      this.handleAuthError();
    });

    this.socket.on('token_warning', data => {
      // console.log('WebSocket token will expire soon:', data);
      this.handleAuthError();
    });

    this.socket.on('update_auth_response', data => {
      if (data.success) {
        // console.log('WebSocket auth updated successfully');
      } else {
        console.warn('WebSocket auth update failed:', data.message);
        this.handleAuthError();
      }
    });

    this.socket.on('notification.created', data => {
      // console.log('New notification received:', data);
      this.emitWebSocketEvent('notification-refresh');
    });

    this.socket.on('notification.read', data => {
      // console.log('Notification marked as read:', data);
      this.emitWebSocketEvent('notification-refresh');
    });

    this.socket.on('notification.updated', data => {
      // console.log('Notification updated:', data);
      this.emitWebSocketEvent('notification-refresh');
    });
  }

  private reconnectWithNewToken(): void {
    // console.log('Reconnecting WebSocket with new token...');
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 500);
  }

  private handleAuthError(): void {
    // console.log('WebSocket auth error, attempting token refresh...');

    // Try to refresh token through AuthService
    if (this.authService.isTokenValid()) {
      // Token is still valid, just retry connection
      setTimeout(() => this.reconnectWithNewToken(), 1000);
    } else {
      // Token might be expired, trigger refresh
      this.authService.refreshToken().subscribe({
        next: () => {
          // console.log('Token refreshed successfully, reconnecting WebSocket...');
          setTimeout(() => this.reconnectWithNewToken(), 500);
        },
        error: err => {
          console.error('Token refresh failed:', err);
          // Let AuthService handle logout
          this.disconnect();
        },
      });
    }
  }

  private emitWebSocketEvent(eventName: string, data?: any): void {
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }
}
