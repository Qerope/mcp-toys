import fs from 'node:fs/promises';
import path from 'node:path';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const ROOT = path.resolve(process.env.NOTES_DIR ?? './notes');

async function listNotes(): Promise<string[]> {
  const entries = await fs.readdir(ROOT, { recursive: true });
  return entries.filter((e) => e.endsWith('.md')).sort();
}

const server = new Server({ name: 'notes', version: '0.1.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'read_note',
      description: 'Read a markdown note by relative path',
      inputSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const args = req.params.arguments as any;
  switch (req.params.name) {
    case 'read_note':
      return { content: [{ type: 'text', text: await fs.readFile(path.join(ROOT, args.name), 'utf8') }] };
    default:
      throw new Error('unknown tool ' + req.params.name);
  }
});

await server.connect(new StdioServerTransport());
