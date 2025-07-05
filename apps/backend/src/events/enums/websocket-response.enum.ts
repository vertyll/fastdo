export enum WebSocketResponse {
  JOIN_ROOM_RESPONSE = 'join_room_response',
  LEAVE_ROOM_RESPONSE = 'leave_room_response',
  MARK_NOTIFICATION_READ_RESPONSE = 'mark_notification_read_response',
  UPDATE_AUTH_RESPONSE = 'update_auth_response',
  CONNECTED = 'connected',
  CONNECTION_ERROR = 'connection_error',
  TOKEN_WARNING = 'token_warning',
  TOKEN_EXPIRED = 'token_expired',
}
