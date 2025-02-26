import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { buildServer } from './notes.js';

await buildServer().connect(new StdioServerTransport());
