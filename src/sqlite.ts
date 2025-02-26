import Database from 'better-sqlite3';

export const db = new Database(process.env.DB ?? 'data.db', { readonly: true });

export function run(sql: string) {
  if (!/^\s*select\b/i.test(sql)) throw new Error('only SELECT statements are allowed');
  return db.prepare(sql).all().slice(0, 200);
}
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({ name: 'sqlite', version: '0.1.0' });

server.tool('query', 'Run a read-only SELECT', { sql: z.string() }, async ({ sql }) => {
  try {
    return { content: [{ type: 'text', text: JSON.stringify(run(sql)) }] };
  } catch (e) {
    return { isError: true, content: [{ type: 'text', text: String(e) }] };
  }
});

await server.connect(new StdioServerTransport());
