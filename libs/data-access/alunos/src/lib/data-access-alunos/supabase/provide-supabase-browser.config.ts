import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { SupabaseBrowserConfig, SUPABASE_BROWSER_CONFIG } from './supabase-config.token';

/**
 * Registra URL e anon key do Supabase no injetor da aplicação.
 */
export function provideSupabaseBrowserConfig(
  config: SupabaseBrowserConfig
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: SUPABASE_BROWSER_CONFIG, useValue: config },
  ]);
}
