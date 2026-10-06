import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateMultiHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { iamInterceptor } from './iam/infrastructure/iam.interceptor';

// en = en_US (default), es = es_419
const stored = localStorage.getItem('smartstock.locale');

// One translation file per bounded context: public/i18n/<context>/en.json and es.json.
// Every owner edits only their own files, so there are no merge conflicts. The loader merges them all.
const i18nContexts = ['shared', 'iam', 'devices', 'catalog', 'sales', 'purchases', 'stock', 'alerts', 'analytics'];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([iamInterceptor])),
    provideNativeDateAdapter(),
    provideTranslateService({
      loader: provideTranslateMultiHttpLoader({
        resources: i18nContexts.map((context) => ({ prefix: `i18n/${context}/`, suffix: '.json' })),
      }),
      fallbackLang: 'en',
      lang: stored === 'es' ? 'es' : 'en',
    }),
  ],
};
