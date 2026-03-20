import { Inject, Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_BROWSER_CONFIG, SupabaseBrowserConfig } from './supabase-config.token';

/**
 * Cliente Supabase singleton por injetor — todo acesso HTTP passa por aqui dentro de data-access.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseBrowserClient {
  readonly client: SupabaseClient;

  constructor(@Inject(SUPABASE_BROWSER_CONFIG) config: SupabaseBrowserConfig) {
    const { url, anonKey } = config;
    if (!url?.trim() || !anonKey?.trim()) {
      throw new Error(
        'Supabase: configure url e anonKey com provideSupabaseBrowserConfig() em app.config.'
      );
    }
    this.client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
}
