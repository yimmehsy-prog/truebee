import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'truebee.db');

const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    topic TEXT,
    highlights TEXT,
    platform TEXT,
    tone TEXT,
    length TEXT,
    language TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

// Try to add new columns if they don't exist (for existing databases)
try {
  db.exec('ALTER TABLE history ADD COLUMN highlights TEXT');
} catch (e) {
  // Column likely exists
}

try {
  db.exec('ALTER TABLE history ADD COLUMN language TEXT');
} catch (e) {
  // Column likely exists
}

export default db;
