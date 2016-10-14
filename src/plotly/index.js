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

export default function dispatch(dataObject, template, method) {
  return Promise.method(asyncPlot)(dataObject, template, method);
}
