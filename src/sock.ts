import { serve, acceptWebSocket, v4 } from './depts.ts';
import { handleWs } from './handle.ts';
import { clients } from './clients.ts';

const PORT = Deno.args[0] || '8080';

if (import.meta.main) {
  for await (const req of serve(`:${PORT}`)) {
    console.log('incomint request');

    const wsReq = {
      conn: req.conn,
      bufReader: req.r,
      bufWriter: req.w,
      headers: req.headers,
    };

    acceptWebSocket(wsReq)
      .then((sock) => {
        const id = v4.generate();
        clients[id] = { ...wsReq, sock };

        handleWs(sock, id);

        console.log('connected users', Object.keys(clients).length);
      })
      .catch(async (e: Error) => {
        console.error(`failed to accept websocket: ${e}`);
        await req.respond({ status: 400 });
      });
  }
}
