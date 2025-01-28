import { Injectable, Logger, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { SEEDER_CONFIG_KEY } from '../../../../common/decorators/seeder.decorator';
import { ISeeder } from '../interfaces/seeder.interface';
import { SeederConfig } from '../types/seeder-config.type';

@Injectable()
export class SeederRunnerService {
  private readonly logger: Logger;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger(SeederRunnerService.name);
  }

  async runSeeders(seeders: Type<ISeeder>[]): Promise<void> {
    this.logger.log('Starting seeding process...');

    for (const seederClass of seeders) {
      const config: SeederConfig = Reflect.getMetadata(SEEDER_CONFIG_KEY, seederClass) || {};

      if (this.shouldRunSeeder(config)) {
        this.logger.log(`Running seeder: ${seederClass.name}`);
        const seeder = await this.moduleRef.create(seederClass);
        await seeder.seed();
        this.logger.log(`Completed seeder: ${seederClass.name}`);
      } else {
        this.logger.warn(`Skipping seeder: ${seederClass.name} (environment mismatch)`);
      }
    }

    this.logger.log('Seeding process completed successfully');
  }

  private shouldRunSeeder(config: SeederConfig): boolean {
    const currentEnv = this.configService.get('app.environment');
    return !config.environment || config.environment.includes(currentEnv);
  }
}
