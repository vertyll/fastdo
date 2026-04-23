import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideStore } from '@ngxs/store';
import { routes } from './app.routes';
import { apiKeyInterceptor } from './core/interceptors/api-key.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { languageInterceptor } from './core/interceptors/language.interceptor';
import { TranslatedTitleStrategy } from './core/strategies/translated-title.strategy';
import { ngxsConfig } from './ngxs.config';
import { FiltersState } from './shared/store/filter/filter.state';
import { NotificationWebSocketService } from './shared/services/notification-websocket.service';
import { ThemeService } from './shared/services/theme.service';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([apiKeyInterceptor, authInterceptor, errorInterceptor, languageInterceptor]),
      withFetch(),
    ),
    provideRouter(routes, withComponentInputBinding()),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
    provideStore([FiltersState], ngxsConfig),
    importProvidersFrom(TranslateModule.forRoot()),
    ...provideTranslateHttpLoader({ prefix: './i18n/', suffix: '.json' }),
    provideAppInitializer(() => {
      inject(NotificationWebSocketService);
      inject(ThemeService);
    }),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic',
      },
    },
  ],
};
