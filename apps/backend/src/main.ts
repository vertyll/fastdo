import fastifyMultipart from '@fastify/multipart';
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoginResponseDto } from './auth/dtos/login-response.dto';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SnakeToCamelCaseInterceptor } from './common/interceptors/snake-to-camel-case.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { WrapResponseInterceptor } from './common/interceptors/wrap-response.interceptor';
import { OpenApiConfig } from './config/types/app.config.type';
import { Project } from './projects/entities/project.entity';
import { Role } from './roles/entities/role.entity';
import { Priority } from './tasks/entities/priority.entity';
import { Task } from './tasks/entities/task.entity';
import { UserRole } from './users/entities/user-role.entity';
import { User } from './users/entities/user.entity';

async function bootstrap(): Promise<void> {
  const app: NestFastifyApplication = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const configService: ConfigService = app.get(ConfigService);

  app.enableCors();

  const maxFileSize: number = configService.getOrThrow<number>('app.file.validation.maxSize');
  await app.register(fastifyMultipart, {
    attachFieldsToBody: true,
    limits: {
      fileSize: maxFileSize,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]): BadRequestException => {
        return new BadRequestException(
          errors.map((error: ValidationError): { field: string; errors: string[]; } => ({
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

  const openApiConfig: OpenApiConfig = configService.getOrThrow<OpenApiConfig>('app.openApi');
  const options: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle(openApiConfig.title)
    .setDescription(openApiConfig.description)
    .setVersion(openApiConfig.version)
    .build();
  const document: OpenAPIObject = SwaggerModule.createDocument(app, options, {
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
  SwaggerModule.setup(openApiConfig.path, app, document);

  const port: number = configService.get<number>('app.port') || 3000;
  await app.listen(port);
}
bootstrap().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
