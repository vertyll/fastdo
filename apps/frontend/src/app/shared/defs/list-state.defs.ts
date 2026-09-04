export type FetchingError = { status: number; code: string | null };

export const LOADING_STATE_VALUE = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
} as const;
