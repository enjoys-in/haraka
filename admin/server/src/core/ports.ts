// TCP reachability probe used by the status dashboard.
import net from 'node:net';

export function checkPort(host: string, port: number, timeout = 1200): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    const finish = (up: boolean) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(up);
    };
    socket.setTimeout(timeout);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });
}
