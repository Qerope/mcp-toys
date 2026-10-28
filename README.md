# mcp-toys

A couple of small [MCP](https://modelcontextprotocol.io) servers for trying
out clients.

- `src/notes.ts`: serves a directory of markdown files. Tools `search_notes`
  and `read_note`, notes as resources, and a `summarise_note` prompt.
- `src/sqlite.ts`: read-only SQL over a sqlite file (`SELECT` only).

    npm install && npm run build
    NOTES_DIR=~/notes node dist/notes.js           # stdio
    NOTES_DIR=~/notes PORT=3000 TOKEN=secret node dist/notes-http.js

Both servers log one JSON line per request to stderr.
