import { EnvironmentEnum } from '../../../config/types/app.config.type';

export interface SeederConfig {
  environment?: EnvironmentEnum[];
  truncate?: boolean;
  priority?: number;
}
