import { InjectionToken } from '@angular/core';

export interface SupabaseBrowserConfig {
  url: string;
  anonKey: string;
}

/**
 * Configuração injetável — deve ser fornecida na app (`provideSupabaseBrowserConfig`).
 */
export const SUPABASE_BROWSER_CONFIG = new InjectionToken<SupabaseBrowserConfig>(
  'SUPABASE_BROWSER_CONFIG'
);
