import pack from 'ndarray-pack';

import Promise from 'vcs/promise';
import plotly from 'vcs/plotly';

const plotlyInjector = require('inject!vcs/plotly');
const isofillInjector = require('inject!vcs/plotly/isofill');

describe('plotly', () => {
  beforeEach(() => {
    Promise.config({
      warnings: false,
    });
  });
  afterEach(() => {
    Promise.config({
      warnings: true,
    });
  });
  describe('dispatch', () => {
    it('error', () => {
      return plotly({}, {}, { type: 'invalid type' }, {})
        .should.be.rejectedWith(Error, /Invalid graphicsMethod type/);
    });
    it('isofill', () => {
      const isofillStub = sinon.spy();
      const plotlyModule = plotlyInjector({
        './isofill': isofillStub,
      }).default;
      const data = { data: [] };
      const gm = {
        type: 'isofill',
        name: 'default',
      };
      const template = {};
      const canvas = { el: 'plot' };
      return plotlyModule(canvas, data, gm, template)
        .then(() => {
          sinon.assert.calledOnce(isofillStub);
          sinon.assert.calledWith(
            isofillStub,
            sinon.match({ data: [], el: 'plot' })
          );
        });
    });
  });

  describe('isofill', () => {
    const plotlyStub = {};

    const isofillModule = isofillInjector({
      plotly: plotlyStub,
    }).default;
    const el = document.createElement('div');

    beforeEach(() => {
      plotlyStub.newPlot = sinon.spy();
    });

    it('z - array data', () => {
      const x = [];
      const y = [];
      const z = [];
      const spec = {
        el,
        x,
        y,
        z,
      };

      isofillModule(spec).should.have.property('plotly');
      sinon.assert.calledOnce(plotlyStub.newPlot);
      sinon.assert.calledWith(
        plotlyStub.newPlot,
        el,
        [sinon.match({
          type: 'contour',
          x,
          y,
          z,
        })],
        sinon.match({})
      );
    });
    it('z - ndarray data', () => {
      const z = pack([0, 1, 2, 3]);

      const spec = {
        el,
        z,
      };

      isofillModule(spec).should.have.property('plotly');
      sinon.assert.calledOnce(plotlyStub.newPlot);
      sinon.assert.calledWith(
        plotlyStub.newPlot,
        el,
        [sinon.match({
          type: 'contour',
          x: undefined,
          y: undefined,
          z: [0, 1, 2, 3],
        })],
        sinon.match({})
      );
    });

    it('x - ndarray data', () => {
      const x = pack([0, 1, 2, 3]);
      const z = [];

      const spec = {
        el,
        x,
        z,
      };

      isofillModule(spec).should.have.property('plotly');
      sinon.assert.calledOnce(plotlyStub.newPlot);
      sinon.assert.calledWith(
        plotlyStub.newPlot,
        el,
        [sinon.match({
          type: 'contour',
          x: [0, 1, 2, 3],
        })],
        sinon.match({})
      );
    });

    it('y - ndarray data', () => {
      const y = pack([0, 1, 2, 3]);
      const z = [];

      const spec = {
        el,
        y,
        z,
      };

      isofillModule(spec).should.have.property('plotly');
      sinon.assert.calledOnce(plotlyStub.newPlot);
      sinon.assert.calledWith(
        plotlyStub.newPlot,
        el,
        [sinon.match({
          type: 'contour',
          y: [0, 1, 2, 3],
        })],
        sinon.match({})
      );
    });
  });
});
