/**
 * Gera `environment.prod.ts` a partir de SUPABASE_URL e SUPABASE_ANON_KEY.
 * Rode antes do `nx build librasflow` (ex.: no buildCommand do Vercel).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

function firstEnv(...keys) {
  for (const key of keys) {
    const v = process.env[key];
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}

/** Nomes aceitos (evita copiar template Next/Vite com prefixo errado). */
const url = firstEnv(
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'VITE_SUPABASE_URL'
);
const anonKey = firstEnv(
  'SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY'
);
const onVercel = process.env.VERCEL === '1';

if (!url || !anonKey) {
  if (onVercel) {
    const missing = [
      !url && 'SUPABASE_URL (ou NEXT_PUBLIC_SUPABASE_URL / VITE_SUPABASE_URL)',
      !anonKey && 'SUPABASE_ANON_KEY (ou NEXT_PUBLIC_* / VITE_* equivalente)',
    ].filter(Boolean);
    console.error('Vercel: faltam variáveis para o build:', missing.join(', '));
    console.error(
      '1) Project → Settings → Environment Variables → adicione para ambiente Production.'
    );
    console.error(
      '2) Não marque como "Sensitive" — no Vercel isso impede o uso no passo de build.'
    );
    console.error('3) Salve e faça Redeploy (Deployments → … → Redeploy).');
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
