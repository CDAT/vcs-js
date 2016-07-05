import Promise from './promise';
import plotly from './plotly';

export default (el, session) => {
  const canvas = {
    el,
    session,
    create(graphicsMethodType, graphicsMethodName) {
      return Promise.delay(0, {
        type: graphicsMethodType,
        name: graphicsMethodName,
        session: this.session,
        canvas: this,
      });
    },
    plot(dataObject, graphicsMethod, template, renderingType) {
      let plotMethod;

      switch (renderingType) {
        case 'webgl': // not really webgl... plotly?, client?,
          plotMethod = plotly;
          break;
        default:
          return Promise.reject(new Error('Invalid renderingType'));
      }
      return plotMethod(this, dataObject, graphicsMethod, template);
    },
  };

  return canvas;
};
