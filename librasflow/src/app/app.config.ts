import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideSupabaseBrowserConfig } from '@sinaliza/data-access-alunos';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideSupabaseBrowserConfig({
      url: environment.supabaseUrl,
      anonKey: environment.supabaseAnonKey,
    }),
  ],
};
