import SmartConnect from 'ParaViewWeb/IO/WebSocket/SmartConnect';
import { createClient } from 'ParaViewWeb/IO/WebSocket/ParaViewWebClient';
import vtkweb from './vtkweb';

export default (url, username, password) => {
  // vtkweb launcher uses a "secret" key rather than user/pass
  // For security we will need to proxy to the launcher through
  // an authenticated service

  const smartConnect = new SmartConnect({
    sessionURL: url,
  });

  const connectionPromise = new Promise((resolve, reject) => {
    smartConnect.onConnectionReady(resolve);
    smartConnect.onConnectionError(reject);
    smartConnect.onConnectionClose(reject);
  });

  // create a pvw client object after the session is ready
  const pvw = connectionPromise.then((connection) => {
    return createClient(
       connection,
      ['MouseHandler', 'ViewPort', 'ViewPortImageDelivery', 'FileListing']);
  });

  const session = {
    close() {
      return connectionPromise.then((connection) => { connection.destroy(); });
    },

    client() {
      return pvw;
    },

    /**
     * Creates a new canvas.
     */
    init(el) {
      const outerSession = this;

      const canvas = {
        el,
        windowId: 0,
        session: outerSession,

        plot(dataSpec, template, method, renderingType) {
          switch (renderingType) {
            case 'server':
              return vtkweb(this, dataSpec, template, method);

            default:
              return Promise.reject(new Error('Invalid renderingType'));
          }
        },

        close() {
          if (this.windowId) {
            console.log(`close canvas ${this.windowId}`);
            this.session.client().then(
              (client) => { client.session.call('cdat.view.close', [this.windowId]); });
          }
        },
      };
      return canvas;
    },
  };

  smartConnect.connect();
  return pvw.then(() => session);
};
