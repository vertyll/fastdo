import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { JwtMiddleware } from './common/middlewares/jwt.middleware';
import appConfig from './core/config/app.config';
import { DatabaseModule } from './core/database/database.module';
import { FileModule } from './core/file/file.module';
import { MailModule } from './core/mail/mail.module';
import { ProjectsModule } from './projects/projects.module';
import { RolesModule } from './roles/roles.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.security.jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('app.security.jwt.expiresIn'),
        },
      }),
    }),
    TasksModule,
    ProjectsModule,
    CommonModule,
    FileModule,
    AuthModule,
    UsersModule,
    RolesModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
