import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/lib/supabase-ca.ts', import.meta.url), 'utf8');
const ca = JSON.parse(source.slice(source.indexOf('=') + 1).trim().replace(/;$/, ''));
const url = new URL(process.env.DATABASE_URL);
for (const name of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) url.searchParams.delete(name);
const local = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
export const databaseConfig = { connectionString: url.toString(), ssl: local ? undefined : { ca, rejectUnauthorized: true } };
