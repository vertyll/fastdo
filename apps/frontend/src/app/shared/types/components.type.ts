import { ToastPositionEnum } from '../enums/toast-position.enum';

/*
 * Type
 */

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

/*
 * Interface
 */

export interface ToastObject {
  message: string;
  visible: boolean;
  success: boolean;
  className: string;
  position: ToastPositionEnum;
}
