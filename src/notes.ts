import fs from 'node:fs/promises';
import path from 'node:path';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const ROOT = path.resolve(process.env.NOTES_DIR ?? './notes');

function resolveNote(name: string): string {
  const full = path.resolve(ROOT, name);
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) {
    throw new Error('path outside notes directory');
  }
  return full;
}

async function listNotes(): Promise<string[]> {
  const entries = await fs.readdir(ROOT, { recursive: true });
  return entries.filter((e) => e.endsWith('.md')).sort();
}

async function searchNotes(query: string) {
  const q = query.toLowerCase();
  const hits: { file: string; line: number; text: string }[] = [];
  for (const file of await listNotes()) {
    const lines = (await fs.readFile(path.join(ROOT, file), 'utf8')).split('\n');
    lines.forEach((text, i) => {
      if (text.toLowerCase().includes(q)) hits.push({ file, line: i + 1, text: text.trim() });
    });
  }
  return hits.slice(0, 50);
}

export function buildServer(): McpServer {
  const server = new McpServer({ name: 'notes', version: '0.2.0' });

  server.tool(
    'read_note',
    'Read a markdown note by relative path',
    { name: z.string() },
    async ({ name }) => ({
      content: [{ type: 'text', text: await fs.readFile(resolveNote(name), 'utf8') }],
    }),
  );

  server.tool(
    'search_notes',
    'Case-insensitive substring search across all notes',
    { query: z.string().min(1) },
    async ({ query }) => ({
      content: [{ type: 'text', text: JSON.stringify(await searchNotes(query)) }],
    }),
  );

  server.resource(
    'note',
    new ResourceTemplate('note://{name}', {
      list: async () => ({
        resources: (await listNotes()).map((f) => ({ uri: 'note://' + f, name: f, mimeType: 'text/markdown' })),
      }),
    }),
    async (uri, { name }) => ({
      contents: [{ uri: uri.href, mimeType: 'text/markdown', text: await fs.readFile(resolveNote(String(name)), 'utf8') }],
    }),
  );

  return server;
}
