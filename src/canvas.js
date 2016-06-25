import Promise from './promise';

export default (el, session) => {
  const canvas = {
    el,
    session,
    create: function create(graphicsMethodType, graphicsMethodName) {
      return Promise.delay(0, {});
    },
    plot: function plot(dataObject, graphicsMethod, template, renderingType) {
      return Promise.delay(0, {});
    },
  };

  return canvas;
};
