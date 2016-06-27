import Promise from '../promise';
import isofill from './isofill';

function asyncPlot(dataObject, graphicsMethod, template) {
  let plotObject;
  switch (graphicsMethod.type) {
    case 'isofill':
      // this interface should be defined concretely somewhere...
      plotObject = isofill(dataObject);
      break;
    default:
      throw new Error('Invalid graphicsMethod type.');
  }
  return plotObject;
}

export default function dispatch(dataObject, graphicsMethod, template) {
  return Promise.method(asyncPlot)(dataObject, graphicsMethod, template);
}
