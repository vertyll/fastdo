export type FetchingError = { status: number; message: string };

/*
 * Type
 */
// * idle - initial
type IdleState = {
  state: LOADING_STATE_VALUE['IDLE'];
};
// * loading
type LoadingState = {
  state: LOADING_STATE_VALUE['LOADING'];
};
// * success
type SuccessState<T> = {
  state: LOADING_STATE_VALUE['SUCCESS'];
  results: T[];
};
// * error
type ErrorState = {
  state: LOADING_STATE_VALUE['ERROR'];
  error: FetchingError;
};

type LOADING_STATE_VALUE = typeof LOADING_STATE_VALUE;

export type ListStateValue = keyof typeof LOADING_STATE_VALUE;

export type ListState<T> = IdleState | LoadingState | SuccessState<T> | ErrorState;

/*
 * Const
 */
export const LOADING_STATE_VALUE = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
} as const;
