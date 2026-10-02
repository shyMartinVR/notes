import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Database } from "bun:sqlite";

export const databasePath = process.env.DATABASE_PATH ?? resolve(import.meta.dir, "../data/notes.sqlite");

mkdirSync(dirname(databasePath), { recursive: true });

export const database = new Database(databasePath);

database.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL CHECK (length(trim(name)) > 0),
        parent_category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL CHECK (length(trim(content)) > 0),
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
    );
`);
