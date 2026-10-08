import express from 'express';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { buildServer } from './notes.js';
import { log } from './log.js';

const app = express();
app.use(express.json());
app.use((req, _res, next) => {
  log('request', { method: req.method, path: req.path, session: req.headers['mcp-session-id'] });
  next();
});

const transports = new Map<string, StreamableHTTPServerTransport>();

app.use((req, res, next) => {
  const token = process.env.TOKEN;
  if (token && req.headers.authorization !== 'Bearer ' + token) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  next();
});

app.post('/mcp', async (req, res) => {
  const sid = req.headers['mcp-session-id'] as string | undefined;
  let transport = sid ? transports.get(sid) : undefined;
  if (!transport) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => {
        transports.set(id, transport!);
      },
    });
    transport.onclose = () => {
      if (transport!.sessionId) transports.delete(transport!.sessionId);
    };
    await buildServer().connect(transport);
  }
  await transport.handleRequest(req, res, req.body);
});

app.listen(Number(process.env.PORT ?? 3000));
