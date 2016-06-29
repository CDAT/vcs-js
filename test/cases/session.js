import Promise from 'vcs/promise';
import createSession from 'vcs/session';

const sessionInjector = require('inject!vcs/session');


describe('session', () => {
  describe('createSession', () => {
    it('successful connection', () => {
      return createSession('myserver', 'auser', 'thepassword')
        .should.eventually.be.an('object');
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
      return createSession('usr', 'user', 'pass')
        .then((_session) => {
          session = _session;
          return session;
        });
    });

    afterEach(() => {
      Promise.config({
        warnings: true,
      });
      session = null;
    });

    it('close a session', () => {
      return session.close()
        .should.eventually.be.fulfilled
        .then(() => {
          session.status().connected.should.equal(false);
        });
    });

    it('status of a started session', () => {
      return session.status().connected.should.equal(true);
    });

    it('list files in a fake session', () => {
      return session.files().should.eventually.eql([]);
    });

    it('list files in a disconnected session', () => {
      session.status().connected.should.equal(true);
      return session.close().then(() => { session.files(); })
        .should.be.rejectedWith(/Session is not connected/);
    });
  });

  describe('girder session', () => {
    it('list files', () => {
      const girderStub = sinon.stub();

      const sessionModule = sessionInjector({
        './girder': () => ({ listFiles: girderStub }),
      }).default;

      girderStub.returns(
        Promise.resolve([{ name: 'data.json', _id: '0' }])
      );

      return sessionModule({
        girder: '/api/v1',
        folder: 'abcdef',
      }).then((session) => session.files())
        .then((files) => {
          files.should.have.lengthOf(1);
          files[0].should.have.property('fileName', 'data.json');
        });
    });

    it('list variables', () => {
      const girderStub = sinon.stub();

      const sessionModule = sessionInjector({
        './girder': () => ({ listFiles: girderStub }),
      }).default;

      girderStub.returns(
        Promise.resolve([{ name: 'data.json', _id: '0' }])
      );

      return sessionModule({
        girder: '/api/v1',
        folder: 'abcdef',
      }).then((session) => session.files())
        .then((files) => files[0].variables())
        .then((variables) => {
          variables.should.eql(['data']);
        });
    });

    it('createData', () => {
      const girderStub = sinon.stub();
      const downloadStub = sinon.stub();

      const sessionModule = sessionInjector({
        './girder': () => ({ listFiles: girderStub, downloadFile: downloadStub }),
      }).default;

      girderStub.returns(
        Promise.resolve([{ name: 'data.json', _id: '0' }])
      );

      downloadStub.returns(
        Promise.resolve({ data: [] })
      );

      return sessionModule({
        girder: '/api/v1',
        folder: 'abcdef',
      }).then((session) => session.files())
        .then((files) => files[0].createData('data'))
        .then((data) => {
          data.should.eql({ data: [] });
        });
    });
  });
});
