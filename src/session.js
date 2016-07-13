import SmartConnect from 'ParaViewWeb/IO/WebSocket/SmartConnect';
import { createClient } from 'ParaViewWeb/IO/WebSocket/ParaViewWebClient';

import Promise from './promise';
import createFile from './file';

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
    return createClient(connection, ['MouseHandler', 'ViewPort', 'ViewPortImageDelivery', 'FileListing']);
  });

  const session = {
    close() {
      return connectionPromise.then((connection) => connection.destroy());
    },
    files(path) {
      return pvw
        .then((client) => client.FileListing.listServerDirectory(path))
        .then((filesObject) => {
          return filesObject.files.map((file) => createFile(session, file.label));
        });
    },
    client() {
      return pvw;
    },
  };

  smartConnect.connect();
  return pvw.then(() => session);
};
