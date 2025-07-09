import { config } from 'dotenv';
config();

import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { LanguageSeeder } from './src/core/database/seeder/implementations/language.seeder';
import { LegalDocumentsSeeder } from './src/core/database/seeder/implementations/legal-documents.seeder';
import { ProjectRoleSeeder } from './src/core/database/seeder/implementations/project-role.seeder';
import { ProjectTypeSeeder } from './src/core/database/seeder/implementations/project-type.seeder';
import { RoleSeeder } from './src/core/database/seeder/implementations/role.seeder';
import { TaskPrioritySeeder } from './src/core/database/seeder/implementations/task-priority-seeder.service';
import { SeederModule } from './src/core/database/seeder/module/seeder.module';
import { SeederRunnerService } from './src/core/database/seeder/services/seeder-runner.service';

const AVAILABLE_SEEDERS = [
  LanguageSeeder,
  RoleSeeder,
  TaskPrioritySeeder,
  ProjectRoleSeeder,
  ProjectTypeSeeder,
  LegalDocumentsSeeder,
];

async function bootstrap(): Promise<void> {
  const app: INestApplicationContext = await NestFactory.createApplicationContext(SeederModule);

  try {
    const seederRunner: SeederRunnerService = app.get(SeederRunnerService);
    const specificSeeder: string = process.argv[2]?.toLowerCase();

    if (specificSeeder) {
      if (specificSeeder === '--list') {
        console.log('Available seeders:');
        AVAILABLE_SEEDERS.forEach(seeder => console.log(`- ${seeder.name}`));
        return;
      }

      const seederToRun = AVAILABLE_SEEDERS.find(
        seeder => seeder.name.toLowerCase() === specificSeeder,
      );

      if (!seederToRun) {
        console.error(`Error: Seeder "${specificSeeder}" not found`);
        console.log('Available seeders:');
        AVAILABLE_SEEDERS.forEach(seeder => console.log(`- ${seeder.name}`));
        process.exit(1);
      }

      await seederRunner.runSeeders([seederToRun]);
    } else {
      await seederRunner.runSeeders(AVAILABLE_SEEDERS);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

bootstrap().catch(error => {
  console.error('Failed to start seeder:', error);
  process.exit(1);
});
