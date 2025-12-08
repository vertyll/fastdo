export interface AuthenticatedSocket {
  id: string;
  userId?: number;
  email?: string;
  emit(event: string, data: any): void;
  disconnect(): void;
  join(room: string): void;
  leave(room: string): void;
  connected: boolean;
  handshake: handshake;
}

interface handshake {
  headers: { [key: string]: string | string[] | undefined };
  query: { [key: string]: string | string[] | undefined };
  auth?: { [key: string]: any };
}

export interface SocketServer {
  to(room: string): {
    emit(event: string, data: any): void;
  };
}
