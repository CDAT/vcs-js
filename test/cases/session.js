import Promise from 'vcs/promise';
import createSession from 'vcs/session';


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
});
