import { ToastPositionEnum } from '../enums/toast-position.enum';

export type InputType =
  | 'text'
  | 'number'
  | 'password'
  | 'email'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'month'
  | 'week'
  | 'url'
  | 'tel'
  | 'search'
  | 'color';

export type SpinnerSize = 'small' | 'medium' | 'large';

export interface ToastObject {
  message: string;
  visible: boolean;
  success: boolean;
  className: string;
  position: ToastPositionEnum;
}
