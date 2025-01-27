import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './core/database/database.module';
import { FileModule } from './core/file/file.module';
import { LanguageModule } from './core/language/language.module';
import { MailModule } from './core/mail/mail.module';
import { ProjectsModule } from './projects/projects.module';
import { RolesModule } from './roles/roles.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    CommonModule,
    DatabaseModule,
    LanguageModule,
    TasksModule,
    ProjectsModule,
    FileModule,
    AuthModule,
    UsersModule,
    RolesModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
