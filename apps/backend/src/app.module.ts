import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './core/database/database.module';
import { FileModule } from './core/file/file.module';
import { LanguageModule } from './core/language/language.module';
import { MailModule } from './core/mail/mail.module';
import { EventsModule } from './events/events.module';
import { NotificationModule } from './notifications/notification.module';
import { ProjectsModule } from './projects/projects.module';
import { RolesModule } from './roles/roles.module';
import { TasksModule } from './tasks/tasks.module';
import { TermsAndPoliciesModule } from './terms-and-policies/terms-and-policies.module';
import { UsersModule } from './users/users.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    CommonModule,
    DatabaseModule,
    LanguageModule,
    AuthModule,
    TasksModule,
    ProjectsModule,
    FileModule,
    UsersModule,
    RolesModule,
    MailModule,
    TermsAndPoliciesModule,
    NotificationModule,
    EventsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
