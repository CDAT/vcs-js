import Plotly from 'plotly.js/dist/plotly-cartesian';
import isofill from './isofill';

function asyncPlot(canvas, dataSpec, template, method) {
  const variable = dataSpec[0];
  return variable.ready.then((arrayAndAxes) => {
    const array = arrayAndAxes[0];
    const axes = arrayAndAxes[1];
    const latIndex = variable.getAxisIndexByType('latitude', array, axes);
    const lonIndex = variable.getAxisIndexByType('longitude', array, axes);
    const selector = axes.map((v, ind) => {
      if (ind === latIndex || ind === lonIndex) {
        return null;
      }
      return 0;
    });

    const data = {
      x: axes[lonIndex].array.data,
      y: axes[latIndex].array.data,
      z: array.array.pick(...selector),
    };

    const spec = Object.assign(
      { el: canvas.el },
      data
    );

    return isofill(spec);
  });

  /*
  switch (graphicsMethodType) {
    case 'isofill':
      break;
    default:
      throw new Error(`Invalid graphicsMethodType:  ${graphicsMethodType}`);
  }
  */
}

function plot(canvas, dataSpec, template, method) {
  return new Promise((resolve, reject) => {
    resolve(asyncPlot(canvas, dataSpec.map(canvas.clients.data.getVariable), template, method));
  });
}

function clear(canvas) {
  Plotly.purge(canvas.el);
}


const o = {
  plot,
  clear,
  close(canvas) {
    this.clear();
  },
};

export { o as default };
