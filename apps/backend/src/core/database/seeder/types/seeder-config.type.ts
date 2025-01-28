import { Environment } from '../../../config/types/app.config.type';

export interface SeederConfig {
  environment?: Environment[];
  truncate?: boolean;
  priority?: number;
}
