import { ConfigService } from '@nestjs/config';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    configService = app.get(ConfigService);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('/ (GET)', async () => {
    const apiKey = configService.get<string>('app.api.keys.apiKey');

    const response = await app.inject({
      method: 'GET',
      url: '/',
      headers: {
        Authorization: apiKey,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.payload).toBe('Hello World!');
  });

  afterAll(async () => {
    await app.close();
  });
});
