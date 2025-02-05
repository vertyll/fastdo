import helmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { BadRequestException, ClassSerializerInterceptor, ConsoleLogger, ValidationError } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { join } from 'path';
import { AppModule } from './app.module';
import { LoginResponseDto } from './auth/dtos/login-response.dto';
import { SnakeToCamelCaseInterceptor } from './common/interceptors/snake-to-camel-case.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { WrapResponseInterceptor } from './common/interceptors/wrap-response.interceptor';
import { OpenApiConfig } from './core/config/types/app.config.type';
import { FileMetadataDto } from './core/file/dtos/file-metadata.dto';
import { File } from './core/file/entities/file.entity';
import { ProjectUser } from './projects/entities/project-user.entity';
import { Project } from './projects/entities/project.entity';
import { Role } from './roles/entities/role.entity';
import { Priority } from './tasks/entities/priority.entity';
import { Task } from './tasks/entities/task.entity';
import { PrivacyPolicySectionTranslation } from './terms-and-policies/entities/privacy-policy-section-translation.entity';
import { PrivacyPolicySection } from './terms-and-policies/entities/privacy-policy-section.entity';
import { PrivacyPolicy } from './terms-and-policies/entities/privacy-policy.entity';
import { TermsSectionTranslation } from './terms-and-policies/entities/terms-section-translation.entity';
import { TermsSection } from './terms-and-policies/entities/terms-section.entity';
import { Terms } from './terms-and-policies/entities/terms.entity';
import { UserEmailHistory } from './users/entities/user-email-history.entity';
import { UserRole } from './users/entities/user-role.entity';
import { User } from './users/entities/user.entity';

async function bootstrap(): Promise<void> {
  const app: NestFastifyApplication = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: new ConsoleLogger({
        json: true,
        colors: true,
      }),
    },
  );
  const configService: ConfigService = app.get(ConfigService);

  await app.register(helmet, {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  });

  app.enableCors({
    origin: configService.get('app.frontend.url'),
    credentials: true,
  });

  const fileUploadsPath: string = configService.getOrThrow<string>('app.file.storage.local.uploadDirPath');
  await app.register(fastifyStatic, {
    root: join(process.cwd(), fileUploadsPath),
    prefix: '/uploads/',
    decorateReply: false,
  });

  const maxFileSize: number = configService.getOrThrow<number>('app.file.validation.maxSize');
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: maxFileSize,
    },
  });

  app.useGlobalPipes(
    // new ValidationPipe({
    //   whitelist: true,
    //   forbidNonWhitelisted: true,
    //   transform: true,
    //   transformOptions: {
    //     enableImplicitConversion: true,
    //   },
    //   exceptionFactory: (errors: ValidationError[]): BadRequestException => {
    //     return new BadRequestException(
    //       errors.map((error: ValidationError): { field: string; errors: string[]; } => ({
    //         field: error.property,
    //         errors: Object.values(error.constraints ?? {}),
    //       })),
    //     );
    //   },
    // }),
    new I18nValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(
    // new HttpExceptionFilter(),
    new I18nValidationExceptionFilter({
      errorFormatter: (errors: ValidationError[]): BadRequestException => {
        return new BadRequestException(
          errors.map((error: ValidationError): { field: string; errors: string[]; } => ({
            field: error.property,
            errors: Object.values(error.constraints ?? {}),
          })),
        );
      },
    }),
  );
  app.useGlobalInterceptors(
    new SnakeToCamelCaseInterceptor(),
    new WrapResponseInterceptor(),
    new TimeoutInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
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
      ProjectUser,
      Priority,
      User,
      Role,
      UserRole,
      File,
      FileMetadataDto,
      LoginResponseDto,
      Terms,
      TermsSection,
      TermsSectionTranslation,
      PrivacyPolicy,
      PrivacyPolicySection,
      PrivacyPolicySectionTranslation,
      UserEmailHistory,
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
