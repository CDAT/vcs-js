import Promise from '../promise';
import isofill from './isofill';

function asyncPlot(canvas, dataObject, graphicsMethod, template) {
  let plotObject;
  const spec = Object.assign(
    { el: canvas.el },
    dataObject
  );
  switch (graphicsMethod.type) {
    case 'isofill':
      // this interface should be defined concretely somewhere...
      plotObject = isofill(spec);
      break;
    default:
      throw new Error('Invalid graphicsMethod type.');
  }
  return plotObject;
}

export default function dispatch(dataObject, graphicsMethod, template) {
  return Promise.method(asyncPlot)(dataObject, graphicsMethod, template);
}
