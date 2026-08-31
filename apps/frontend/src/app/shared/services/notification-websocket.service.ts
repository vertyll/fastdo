import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthStateService } from '../../auth/data-access/auth.state.service';
import { NotificationDto, NotificationWsEvent } from '../defs/notification.defs';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

const NOTIFICATIONS_DESTINATION = '/user/queue/notifications';
const UNREAD_DESTINATION = '/user/queue/notifications.unread';
const RECONNECT_DELAY_MS = 5_000;
const HEARTBEAT_MS = 10_000;

@Injectable({
  providedIn: 'root',
})
export class NotificationWebSocketService {
  private readonly authStateService = inject(AuthStateService);
  private readonly destroyRef = inject(DestroyRef);

  private client: Client | null = null;

  private readonly status = signal<ConnectionStatus>('disconnected');
  private readonly eventsSubject = new Subject<NotificationWsEvent>();

  public readonly connectionStatus = this.status.asReadonly();
  public readonly events$ = this.eventsSubject.asObservable();

  constructor() {
    effect(() => (this.authStateService.isLoggedIn() ? this.connect() : this.disconnect()));
    this.destroyRef.onDestroy(() => this.disconnect());
  }

  public isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  private connect(): void {
    if (this.client) {
      return;
    }

    this.status.set('connecting');

    const client = new Client({
      brokerURL: this.brokerUrl(),
      reconnectDelay: RECONNECT_DELAY_MS,
      heartbeatIncoming: HEARTBEAT_MS,
      heartbeatOutgoing: HEARTBEAT_MS,
      onConnect: () => {
        this.status.set('connected');
        this.eventsSubject.next({ type: 'connected' });
        client.subscribe(NOTIFICATIONS_DESTINATION, message => this.onNotification(message));
        client.subscribe(UNREAD_DESTINATION, message => this.onUnreadCount(message));
      },
      onWebSocketClose: () => this.markDisconnected(),
      onStompError: frame => {
        console.error('STOMP error:', frame.headers['message'], frame.body);
        this.markDisconnected();
      },
    });

    this.client = client;
    client.activate();
  }

  private disconnect(): void {
    const client = this.client;
    this.client = null;
    if (client) {
      void client.deactivate();
    }
    this.markDisconnected();
  }

  private onNotification(message: IMessage): void {
    const notification = this.parse<NotificationDto>(message);
    if (notification) {
      this.eventsSubject.next({ type: 'notification-received', notification });
    }
  }

  private onUnreadCount(message: IMessage): void {
    const payload = this.parse<{ unread: number }>(message);
    if (payload) {
      this.eventsSubject.next({ type: 'unread-count', unread: payload.unread });
    }
  }

  private parse<T>(message: IMessage): T | null {
    try {
      return JSON.parse(message.body) as T;
    } catch {
      console.error('Unreadable notification frame:', message.body);
      return null;
    }
  }

  private markDisconnected(): void {
    if (this.status() === 'disconnected') {
      return;
    }
    this.status.set('disconnected');
    this.eventsSubject.next({ type: 'disconnected' });
  }

  private brokerUrl(): string {
    const url = new URL('/ws/notifications', environment.apiUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString();
  }
}
