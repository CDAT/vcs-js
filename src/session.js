import Promise from './promise';

export default (url, username, password) => {
  let connected = false;
  const session = {
    assertConnected: function assertConnected() {
      if (!session.status().connected) {
        throw new Error('Session is not connected');
      }
    },
    close: function close() {
      connected = false;
      return Promise.resolve(session);
    },
    status: function status() {
      return {
        connected,
        url,
      };
    },
    files: function files() {
      session.assertConnected();
      return Promise.delay(0, []);
    },
  };

  // fake an async connection
  const promise = Promise.delay(0).then(() => {
    connected = true;
  }).then(() => session);

  if (!username || !password) {
    return Promise.reject(new Error('Authentication required'));
  }
  return promise;
};
