import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { provideTranslateCompiler, provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { provideStore } from '@ngxs/store';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { initializeLanguage } from './core/i18n/language.initializer';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { languageInterceptor } from './core/interceptors/language.interceptor';
import { BackendCatalogueLoader } from './core/i18n/backend-catalogue.loader';
import { TranslatedTitleStrategy } from './core/strategies/translated-title.strategy';
import { ngxsConfig } from './ngxs.config';
import { FiltersState } from './shared/store/filter/filter.state';
import { AuthService } from './auth/data-access/auth.service';
import { NotificationWebSocketService } from './shared/services/notification-websocket.service';
import { ThemeService } from './shared/services/theme.service';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, languageInterceptor])),
    provideRouter(routes, withComponentInputBinding()),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
    provideStore([FiltersState], ngxsConfig),
    provideTranslateService(),
    provideTranslateLoader(BackendCatalogueLoader),
    provideTranslateCompiler(TranslateMessageFormatCompiler),
    provideAppInitializer(() => {
      initializeLanguage();
      const session$ = inject(AuthService).loadSession();
      inject(NotificationWebSocketService);
      inject(ThemeService);
      return session$;
    }),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic',
      },
    },
    provideNativeDateAdapter(),
  ],
};
