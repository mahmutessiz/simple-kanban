import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Get database path from env - strip file: prefix if present
const envDbPath = process.env.DB_FILE_NAME || 'file:local.db';
const dbPath = envDbPath.replace(/^file:/, '');

// Ensure data directory exists
import { mkdirSync } from 'fs';
import { dirname } from 'path';
try {
    mkdirSync(dirname(dbPath), { recursive: true });
} catch {
    // Directory already exists
}

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
