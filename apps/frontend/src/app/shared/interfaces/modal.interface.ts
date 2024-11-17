import { SimpleNameItem } from './general.interface';

export interface ModalInput<T = any> {
  id: string;
  type: ModalInputType;
  required: boolean;
  message?: string;
  error?: string;
  value?: T;
  label?: string;
  selectOptions?: SimpleNameItem[];
  change?: (value: T) => void;
  onSearch?: (searchTerm: string) => void;
}

export interface ModalButton<T = any> {
  text: string;
  role: ButtonRole;
  handler?: ((inputs: T) => void) | (() => void) | Promise<void>;
}

export interface ModalOptions {
  title: string;
  message?: string;
  error?: string;
  loading?: boolean;
  components?: {
    component: any;
    data: Object;
  }[];
  inputs?: ModalInput[];
  buttons?: ModalButton[];
}

export interface ModalConfig {
  visible: boolean;
  options?: ModalOptions;
}

export enum ButtonRole {
  Cancel = 'cancel',
  Ok = 'ok',
  Reject = 'reject',
}

export enum ModalInputType {
  Text = 'text',
  Number = 'number',
  Date = 'date',
  Checkbox = 'checkbox',
  Textarea = 'textarea',
  Select = 'select',
  EditableMultiSelect = 'editableMultiSelect',
  DatetimeLocal = 'datetime-local',
}
