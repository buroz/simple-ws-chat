import { BufWriter, BufReader, WebSocket } from './depts.ts';

export const clients: Record<
  string,
  {
    conn: Deno.Conn;
    bufReader: BufReader;
    bufWriter: BufWriter;
    headers: Headers;
    sock: WebSocket;
  }
> = {};
