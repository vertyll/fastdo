import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoginResponseDto } from './auth/dtos/login-response.dto';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SnakeToCamelCaseInterceptor } from './common/interceptors/snake-to-camel-case.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { WrapResponseInterceptor } from './common/interceptors/wrap-response.interceptor';
import { Project } from './projects/entities/project.entity';
import { Role } from './roles/entities/role.entity';
import { Priority } from './tasks/entities/priority.entity';
import { Task } from './tasks/entities/task.entity';
import { UserRole } from './users/entities/user-role.entity';
import { User } from './users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: errors => {
        return new BadRequestException(
          errors.map(error => ({
            field: error.property,
            errors: Object.values(error.constraints ?? {}),
          })),
        );
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new SnakeToCamelCaseInterceptor(),
    new WrapResponseInterceptor(),
    new TimeoutInterceptor(),
  );

  const options = new DocumentBuilder()
    .setTitle('fastdo')
    .setDescription('todo list api')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    extraModels: [
      Task,
      Project,
      Priority,
      User,
      Role,
      UserRole,
      LoginResponseDto,
    ],
  });
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
