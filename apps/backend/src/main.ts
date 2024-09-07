import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SnakeToCamelCaseInterceptor } from './common/interceptors/snake-to-camel-case.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { WrapResponseInterceptor } from './common/interceptors/wrap-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Apply filters and interceptors only to API paths
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.use(
    '/api',
    (_req: Request, _res: Response, next: NextFunction) => {
      app.useGlobalFilters(new HttpExceptionFilter());
      app.useGlobalInterceptors(
        new WrapResponseInterceptor(),
        new TimeoutInterceptor(),
        new SnakeToCamelCaseInterceptor(),
      );
      next();
    },
  );

  const options = new DocumentBuilder()
    .setTitle('fastdo')
    .setDescription('todo list api')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
