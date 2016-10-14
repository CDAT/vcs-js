import Plotly from 'plotly.js/dist/plotly-cartesian';
import unpack from 'ndarray-unpack';
import isnd from 'isndarray';

export default (spec) => {
  let { x, y, z } = spec;
  const { el, title } = spec;

  x = isnd(x) ? unpack(x) : x;
  y = isnd(y) ? unpack(y) : y;
  z = isnd(z) ? unpack(z) : z;

  const data = {
    x,
    y,
    z,
    type: 'contour', // or contourgl when it works
  };

  const layout = {
    title,
  };

  const plot = Plotly.newPlot(el, [data], layout);
  return Object.create(spec, {
    plotly: {
      plot,
      data,
      layout,
    },
  });
};
