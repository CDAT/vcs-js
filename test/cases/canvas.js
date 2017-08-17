import Promise from 'vcs/promise';
import createCanvas from 'vcs/canvas';

const canvasInjector = require('inject!vcs/canvas');

describe('canvas', () => {
  let el;
  let session;  // mock session object, expand as needed
  beforeEach(() => {
    el = document.createElement('div');
    session = {};
  });
  describe('construction', () => {
    it('el', () => {
      createCanvas(el, session)
        .should.have.property('el', el);
    });
    it('session', () => {
      createCanvas(el, session)
        .should.have.property('session', session);
    });
  });
  describe('create', () => {
    it('isofill - default', () => {
      createCanvas(el, session)
        .create('isofill', 'default')
        .then((gm) => {
          gm.should.have.property('type', 'isofill');
          gm.should.have.property('name', 'default');
        });
    });
  });
  describe('plot', () => {
    it('error', () => {
      createCanvas(el, session)
        .plot({}, {}, {}, 'not a valid rendering type')
        .should.be.rejectedWith(Error, /Invalid/);
    });

    it('plotly', () => {
      const plot = sinon.stub().returns(Promise.resolve({}));
      const plotlyInjectedCanvas = canvasInjector({
        './plotly': plot,
      }).default;
      const data = {};
      const gm = {};
      const template = {};

      return plotlyInjectedCanvas(el, session)
        .plot(data, gm, template, 'webgl')
        .then((plt) => {
          plt.should.eql({});
        });
    });

    it('vtkweb', () => {
      const plot = sinon.stub().returns(Promise.resolve({}));
      const vtkwebInjectedCanvas = canvasInjector({
        './vtkweb': plot,
      }).default;
      const data = {};
      const gm = {};
      const template = {};

      return vtkwebInjectedCanvas(el, session)
        .plot(data, gm, template, 'vtkweb')
        .then((plt) => {
          plt.should.eql({});
        });
    });
  });
});
