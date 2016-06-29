import $ from 'jquery';
import girder from 'vcs/girder';

describe('girder', () => {
  beforeEach(() => {
    sinon.stub($, 'ajax');
  });
  afterEach(() => {
    $.ajax.restore();
  });
  it('apiroot', () => {
    girder('/api/v1')
      .should.have.property('apiroot', '/api/v1');
  });

  describe('request', () => {
    it('get', () => {
      $.ajax.returns(Promise.resolve({ c: 'd' }));

      girder('/api/v1')
        .request('item', { a: 'b' })
        .then((response) => {
          response.should.eql({ c: 'd' });
        });

      sinon.assert.calledOnce($.ajax);
      sinon.assert.calledWith($.ajax,
        '/api/v1/item',
        sinon.match({
          method: 'GET',
          data: {
            a: 'b',
          },
        })
      );
    });
    it('post', () => {
      $.ajax.returns(Promise.resolve({ c: 'd' }));

      girder('/api/v1')
        .request('item', undefined, 'POST')
        .then((response) => {
          response.should.eql({ c: 'd' });
        });

      sinon.assert.calledOnce($.ajax);
      sinon.assert.calledWith($.ajax,
        '/api/v1/item',
        sinon.match({
          method: 'POST',
        })
      );
    });
  });

  it('itemsInFolder', () => {
    $.ajax.returns(Promise.resolve([{ _id: '0' }]));

    girder('/api/v1')
      .itemsInFolder('abcdef')
      .then((response) => {
        response.should.eql([{ _id: '0' }]);
      });

    sinon.assert.calledOnce($.ajax);
    sinon.assert.calledWith($.ajax,
      '/api/v1/item',
      sinon.match({
        method: 'GET',
        data: {
          folderId: 'abcdef',
        },
      })
    );
  });

  it('filesInItem', () => {
    $.ajax.returns(Promise.resolve([{ _id: '0' }]));

    girder('/api/v1')
      .filesInItem('abcdef')
      .then((response) => {
        response.should.eql([{ _id: '0' }]);
      });

    sinon.assert.calledOnce($.ajax);
    sinon.assert.calledWith($.ajax,
      '/api/v1/item/abcdef/files',
      sinon.match({
        method: 'GET',
      })
    );
  });

  describe('listFiles', () => {
    beforeEach(() => {
      $.ajax.onFirstCall().returns(
        Promise.resolve([{ _id: '0' }, { _id: '1' }])
      );
      $.ajax.onSecondCall().returns(
        Promise.resolve([])
      );
      $.ajax.onThirdCall().returns(
        Promise.resolve([{ _id: '2' }, { _id: '3' }])
      );
    });

    it('default', () => {
      return girder('/api/v1')
        .listFiles('abcdef')
        .then((response) => {
          sinon.assert.calledThrice($.ajax);
          response.should.eql([{ _id: '2' }, { _id: '3' }]);
        });
    });

    it('limit 2', () => {
      return girder('/api/v1')
        .listFiles('abcdef', { limit: 2 })
        .then((response) => {
          sinon.assert.calledThrice($.ajax);
          response.should.eql([{ _id: '2' }, { _id: '3' }]);
        });
    });
  });

  it('downloadFile', () => {
    $.ajax.returns(Promise.resolve({ mydata: true }));

    girder('/api/v1')
      .downloadFile('abcdef')
      .then((data) => {
        data.should.eql({ mydata: true });
      });

    sinon.assert.calledOnce($.ajax);
    sinon.assert.calledWith($.ajax,
      '/api/v1/file/abcdef/download'
    );
  });
});
