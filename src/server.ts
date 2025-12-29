import { Server } from 'http';
import colors from 'colors';
import app from './app';
import config from '@app/config';

let server: Server;
 

async function main() {
  server = app.listen(Number(config.port), config?.ip as string, () => {
    console.log(
      colors.italic.green.bold(
        `💫 Simple Server Listening on  http://${config?.ip}:${config.port} `
      )
    );
  });
}

main();

process.on('unhandledRejection', err => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
