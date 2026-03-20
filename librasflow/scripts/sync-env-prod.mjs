/**
 * Gera `environment.prod.ts` a partir de SUPABASE_URL e SUPABASE_ANON_KEY.
 * Rode antes do `nx build librasflow` (ex.: no buildCommand do Vercel).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

const url = (process.env.SUPABASE_URL ?? '').trim();
const anonKey = (process.env.SUPABASE_ANON_KEY ?? '').trim();
const onVercel = process.env.VERCEL === '1';

if (!url || !anonKey) {
  if (onVercel) {
    console.error(
      'Vercel: defina SUPABASE_URL e SUPABASE_ANON_KEY em Settings → Environment Variables (Production).'
    );
    process.exit(1);
  }
  console.warn(
    '[sync-env-prod] SUPABASE_URL / SUPABASE_ANON_KEY ausentes — mantendo environment.prod.ts do repositório.'
  );
  process.exit(0);
}

const contents = `/**
 * Produção — preenchido em CI (sync-env-prod.mjs) a partir de variáveis de ambiente.
 * Não commite credenciais aqui.
 */
export const environment = {
  production: true,
  supabaseUrl: ${JSON.stringify(url)},
  supabaseAnonKey: ${JSON.stringify(anonKey)},
};
`;

fs.writeFileSync(outFile, contents, 'utf8');
console.log('[sync-env-prod] environment.prod.ts atualizado a partir do ambiente.');
