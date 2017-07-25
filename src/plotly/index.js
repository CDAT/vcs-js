import isofill from './isofill';

function asyncPlot(canvas, dataObject, template, method) {
  const spec = Object.assign(
    { el: canvas.el },
    dataObject
  );
  const plotObject = isofill(spec);
  /*
  switch (graphicsMethodType) {
    case 'isofill':
      break;
    default:
      throw new Error(`Invalid graphicsMethodType:  ${graphicsMethodType}`);
  }
  */
  return plotObject;
}

function plot(dataObject, template, method) {
  return new Promise((resolve, reject) => {
    resolve(asyncPlot(dataObject, template, method));
  });
}

const o = {
  plot,
};

export { o as default };
