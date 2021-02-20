import { isWebSocketCloseEvent, isWebSocketPingEvent, WebSocket } from './depts.ts';
import { clients } from './clients.ts';

export async function handleWs(sock: WebSocket, id: string): Promise<void> {
  console.log('socket connected!');
  try {
    for await (const ev of sock) {
      if (typeof ev === 'string') {
        const action = ev.split(' ')[0];

        if (action === '/msg') {
          const args = ev.split(' ');
          const to = args[1];
          const msg = args.slice(1);
          await clients[to].sock.send(msg.join(' '));
        }

        if (action === '/users') {
          await sock.send(JSON.stringify(Object.keys(clients)));
        }
      } else if (isWebSocketCloseEvent(ev)) {
        // const { code, reason } = ev;
        // console.log('ws:Close', code, reason);
        console.log(id, 'closed');
        delete clients[id];
      } else if (ev instanceof Uint8Array) {
        console.log('ws:Binary', ev);
      } else if (isWebSocketPingEvent(ev)) {
        const [, body] = ev;
        console.log('ws:Ping', body);
      }
    }
  } catch (err) {
    console.error(`failed to receive frame: ${err}`);

    if (!sock.isClosed) {
      await sock.close(1000).catch(console.error);
    }
  }
}
