import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Get database path from env - ensure file: prefix is present for libsql
const envDbPath = process.env.DB_FILE_NAME || 'file:local.db';
const dbPath = envDbPath.startsWith('file:') ? envDbPath : `file:${envDbPath}`;

// Ensure data directory exists
import { mkdirSync } from 'fs';
import { dirname } from 'path';
try {
    mkdirSync(dirname(dbPath.replace(/^file:/, '')), { recursive: true });
} catch {
    // Directory already exists
}

const client = createClient({ url: dbPath });
export const db = drizzle(client, { schema });
