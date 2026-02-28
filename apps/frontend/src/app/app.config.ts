import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideStore } from '@ngxs/store';
import { routes } from './app.routes';
import { apiKeyInterceptor } from './core/interceptors/api-key.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { languageInterceptor } from './core/interceptors/language.interceptor';
import { ngxsConfig } from './ngxs.config';
import { FiltersState } from './shared/store/filter/filter.state';
import { NotificationWebSocketService } from './shared/services/notification-websocket.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(
      withInterceptors([apiKeyInterceptor, authInterceptor, errorInterceptor, languageInterceptor]),
      withFetch(),
    ),
    provideRouter(routes, withComponentInputBinding()),
    provideStore([FiltersState], ngxsConfig),
    importProvidersFrom(TranslateModule.forRoot()),
    ...provideTranslateHttpLoader({ prefix: './i18n/', suffix: '.json' }),
    provideAppInitializer(() => {
      inject(NotificationWebSocketService);
    }),
  ],
};
