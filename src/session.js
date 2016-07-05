import ndarray from 'ndarray';

import Promise from './promise';
import girder from './girder';

export default (url, username, password) => {
  let connected = false;
  const session = {
    assertConnected() {
      if (!this.status().connected) {
        throw new Error('Session is not connected');
      }
    },
    close() {
      connected = false;
      return Promise.resolve(session);
    },
    status() {
      return {
        connected,
        url,
      };
    },
    files() {
      this.assertConnected();
      return Promise.delay(0, []);
    },
  };

  // Get a girder version of the file object.
  // It is still unresolved where the code should diverge
  // for different session types.  Should file/canvas objects
  // delegate to a private session interface or should sessions
  // construct different kinds of objects according to the
  // session properties.
  //
  // This is a temporary hack.
  function girderFile(fileModel) {
    return {
      session,
      fileName: fileModel.name,
      variables() {
        return Promise.resolve([fileModel.name.replace(/\.[^.]*$/, '')]);
      },
      createData() {
        // This converts from the source data format to the data format
        // accepted by plot method both of which are not yet defined explicitly.
        return session.girder.downloadFile(fileModel._id)
          .then((spec) => ({ z: ndarray(spec.data, spec.shape) }));
      },
    };
  }

  // warning: extreme hackery
  if (url.girder) {
    session.girder = girder(url.girder);
    session.files = () => session.girder.listFiles(url.folder).then((files) => files.map(girderFile));
  }

  // fake an async connection
  const promise = Promise.delay(0).then(() => {
    connected = true;
  }).then(() => session);

  return promise;
};
