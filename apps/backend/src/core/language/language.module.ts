import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { join } from 'node:path';

@Module({
  imports: [
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('app.language.fallbackLanguage'),
        fallbacks: {
          en: 'en',
          pl: 'pl',
        },
        loaderOptions: {
          path: join(process.cwd(), configService.getOrThrow('app.language.languageDirPath')),
          watch: true,
        },
        typesOutputPath: join(process.cwd(), configService.getOrThrow('app.language.typesOutputPath')),
      }),
      resolvers: [new HeaderResolver(['x-lang']), AcceptLanguageResolver, { use: QueryResolver, options: ['lang'] }],
      inject: [ConfigService],
    }),
  ],
  controllers: [],
})
export class LanguageModule {}
