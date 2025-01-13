import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
// import { SnakeToCamelCaseInterceptor } from "./common/interceptors/snake-to-camel-case.interceptor";
// import { WrapResponseInterceptor } from "./common/interceptors/wrap-response.interceptor";

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
            errors: Object.values(error.constraints),
          })),
        );
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    // new WrapResponseInterceptor(),
    new TimeoutInterceptor(),
    // new SnakeToCamelCaseInterceptor()
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
bootstrap().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
