import Promise from 'vcs/promise';
import createFile from 'vcs/file';

describe('file', () => {
  let session;  // mock session object, expand as needed
  let client;
  beforeEach(() => {
    // turn off warnings because chai-as-promised converts
    // Error objects into regular objects.  :(
    Promise.config({
      warnings: false,
    });
    client = {
      session: {
        call: sinon.stub(),
      },
    };
    session = {
      client: () => Promise.resolve(client),
    };
  });
  afterEach(() => {
    Promise.config({
      warnings: true,
    });
  });
  describe('construction', () => {
    it('fileName', () => {
      createFile(session, 'myFile.nc')
        .should.have.property('fileName', 'myFile.nc');
    });
    it('session', () => {
      createFile(session, 'myFile.nc')
        .should.have.property('session', session);
    });
    it('variables', () => {
      // This test should eventually work with a mocked session object
      // to ensure variables are parsed correctly.
      return createFile(session, 'myFile.nc')
        .variables()
        .then(() => {
          sinon.assert.calledOnce(client.session.call);
          sinon.assert.calledWith(client.session.call, 'file.netcdf.variables', ['myFile.nc']);
        });
    });
    it('createData', () => {
      // This test should eventually work with a mocked session object
      // to ensure data objects are generated correctly.
      const fileObj = createFile(session, 'myFile.nc');

      return fileObj.createData('var', 'subset')
        .should.eventually.eql({
          session: session,
          file: fileObj,
          variable: 'var',
          subset: 'subset',
        });
    });
    it('set', () => {
      // The interface to this method needs to be defined.
      createFile(session, 'myFile.nc')
        .set().should.be.rejected;
    });
  });
});
