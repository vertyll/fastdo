import { ButtonRoleEnum, ModalInputTypeEnum } from '../enums/modal.enum';
import { SimpleNameItem } from './common.type';

/*
 * Interface
 */
export interface ModalInput<T = any> {
  id: string;
  type: ModalInputTypeEnum;
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
  role: ButtonRoleEnum;
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
