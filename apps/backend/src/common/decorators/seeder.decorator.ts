import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { SeederConfig } from '../../core/database/seeder/types/seeder-config.type';

export const SEEDER_CONFIG_KEY = 'seeder:config';

export const Seeder = (config: SeederConfig = {}): CustomDecorator<string> => {
  return SetMetadata(SEEDER_CONFIG_KEY, {
    environment: config.environment || [],
    truncate: config.truncate || false,
    priority: config.priority || 100,
  });
};
