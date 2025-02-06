import Database from 'better-sqlite3';

export const db = new Database(process.env.DB ?? 'data.db', { readonly: true });

export function run(sql: string) {
  if (!/^\s*select\b/i.test(sql)) throw new Error('only SELECT statements are allowed');
  return db.prepare(sql).all().slice(0, 200);
}
