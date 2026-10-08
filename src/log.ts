export function log(event: string, data: Record<string, unknown> = {}) {
  console.error(JSON.stringify({ t: new Date().toISOString(), event, ...data }));
}
