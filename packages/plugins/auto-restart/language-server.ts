import { LanguageServerPlugin } from '@sqltools/core/interface/plugin';
import { ExitCalledNotification } from './contracts';

const AutoRestartPlugin: LanguageServerPlugin = {
  register: server => {
    const nodeExit = process.exit;
    process.exit = ((code?: number): void => {
      const stack = new Error('stack');
      server.sendNotification(ExitCalledNotification, [code ? code : 0, stack.stack]);
      setTimeout(() => {
        nodeExit(code);
      }, 1000);
    }) as any;
    process.on('uncaughtException', (error: any) => {
      let message: string;
      if (error) {
        server.telemetry.registerException(error, { type: 'uncaughtException' })
        if (typeof error.stack === 'string') {
          message = error.stack;
        } else if (typeof error.message === 'string') {
          message = error.message;
        } else if (typeof error === 'string') {
          message = error;
        } else {
          message = (error || '').toString()
        }
      }
      if (message) {
        server.telemetry.registerInfoMessage(message);
      }
    });
  },
}

export default AutoRestartPlugin;