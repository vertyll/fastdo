import { ModalInputType } from '../types/components.type';
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
  role: 'cancel' | 'ok' | 'reject';
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
