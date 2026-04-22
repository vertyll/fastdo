export type FetchingError = { status: number; message: string };

type IdleState = {
  state: LOADING_STATE_VALUE['IDLE'];
};

type LoadingState = {
  state: LOADING_STATE_VALUE['LOADING'];
};

type SuccessState<T> = {
  state: LOADING_STATE_VALUE['SUCCESS'];
  results: T[];
};

type ErrorState = {
  state: LOADING_STATE_VALUE['ERROR'];
  error: FetchingError;
};

type LOADING_STATE_VALUE = typeof LOADING_STATE_VALUE;

export type ListStateValue = keyof typeof LOADING_STATE_VALUE;

export type ListState<T> = IdleState | LoadingState | SuccessState<T> | ErrorState;

export const LOADING_STATE_VALUE = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
} as const;
