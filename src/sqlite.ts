import Database from 'better-sqlite3';

export const db = new Database(process.env.DB ?? 'data.db', { readonly: true });

export function run(sql: string) {
  return db.prepare(sql).all().slice(0, 200);
}
