import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';

@Module({
  imports: [
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('app.language.fallbackLanguage'),
        fallbacks: {
          en: 'en',
        },
        loaderOptions: {
          path: join(process.cwd(), configService.getOrThrow('app.language.languageDirPath')),
          watch: true,
        },
        typesOutputPath: join(process.cwd(), configService.getOrThrow('app.language.typesOutputPath')),
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      inject: [ConfigService],
    }),
  ],
  controllers: [],
})
export class LanguageModule {}
