import createFile from 'vcs/file';

describe('file', () => {
  let session;  // mock session object, expand as needed
  beforeEach(() => {
    session = {};
  });
  describe('construction', () => {
    it('fileName', () => {
      createFile(session, 'myFile.nc')
        .should.eventually.have.property('fileName', 'myFile.nc');
    });
    it('session', () => {
      createFile(session, 'myFile.nc')
        .should.eventually.have.property('session', session);
    });
    it('variables', () => {
      // This test should eventually work with a mocked session object
      // to ensure variables are parsed correctly.
      createFile(session, 'myFile.nc')
        .then((file) => {
          file.variables().should.eventually.eql([]);
        });
    });
    it('createData', () => {
      // This test should eventually work with a mocked session object
      // to ensure data objects are generated correctly.
      createFile(session, 'myFile.nc')
        .then((file) => {
          file.createData().should.eventually.to.exist;
        });
    });
    it('set', () => {
      // The interface to this method needs to be defined.
      createFile(session, 'myFile.nc')
        .then((file) => {
          file.set().should.eventually.equal(true);
        });
    });
  });
});
