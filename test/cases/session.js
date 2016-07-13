import Promise from 'vcs/promise';

const sessionInjector = require('inject!vcs/session');

describe('session', () => {
  let createSession;
  let fakeSession;
  let fakeClient;
  let fakeConnection;
  let fakeCreateClient;
  let fakeCreateFile;

  beforeEach(() => {
    fakeSession = {
      onConnectionReady: sinon.stub(),
      onConnectionError: sinon.stub(),
      onConnectionClose: sinon.stub(),
      connect: sinon.stub(),
    };

    fakeConnection = {
      destroy: sinon.stub(),
    };

    fakeClient = {};

    fakeCreateFile = sinon.stub();

    fakeCreateClient = sinon.stub().returns(fakeClient);

    createSession = sessionInjector({
      'ParaViewWeb/IO/WebSocket/SmartConnect': sinon.stub().returns(fakeSession),
      'ParaViewWeb/IO/WebSocket/ParaViewWebClient': { createClient: fakeCreateClient },
      './file': fakeCreateFile,
    }).default;
  });

  describe('createSession', () => {
    it('successful connection', () => {
      const sessionPromise = createSession('myserver', 'auser', 'thepassword');

      sinon.assert.calledOnce(fakeSession.onConnectionReady);
      sinon.assert.calledOnce(fakeSession.connect);

      fakeSession.onConnectionReady.getCall(0).args[0](Promise.resolve(fakeConnection));

      return sessionPromise.then((session) => {
        sinon.assert.calledOnce(fakeCreateClient);
        sinon.assert.calledWith(fakeCreateClient, fakeConnection, ['MouseHandler', 'ViewPort', 'ViewPortImageDelivery', 'FileListing']);

        return session.close();
      }).then(() => {
        sinon.assert.calledOnce(fakeConnection.destroy);
      });
    });
  });

  describe('session methods', () => {
    let session;
    beforeEach(() => {
      // turn off warnings because chai-as-promised converts
      // Error objects into regular objects.  :(
      Promise.config({
        warnings: false,
      });
      const sessionPromise = createSession('usr', 'user', 'pass')
        .then((_session) => {
          session = _session;
          return session;
        });

      fakeSession.onConnectionReady.getCall(0).args[0](Promise.resolve(fakeConnection));
      return sessionPromise;
    });

    afterEach(() => {
      Promise.config({
        warnings: true,
      });
      session = null;
    });

    it('close a session', () => {
      return session.close()
        .should.eventually.be.fulfilled;
    });

    it('list files in a fake session', () => {
      fakeClient.FileListing = {
        listServerDirectory() {
          return Promise.resolve({
            files: [{ label: 'a' }, { label: 'b' }],
          });
        },
      };

      fakeCreateFile.returnsArg(1);
      return session.files().should.eventually.eql(['a', 'b']);
    });

    it('get the client object', () => {
      return session.client().should.eventually.eql(fakeClient);
    });
  });
});
