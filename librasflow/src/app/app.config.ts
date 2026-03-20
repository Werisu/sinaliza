import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideSupabaseBrowserConfig } from '@sinaliza/data-access-alunos';
import { ThemeService } from '@sinaliza/ui-components';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => {
      inject(ThemeService).init();
    }),
    provideRouter(appRoutes),
    provideSupabaseBrowserConfig({
      url: environment.supabaseUrl,
      anonKey: environment.supabaseAnonKey,
    }),
  ],
};
