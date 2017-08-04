import $ from 'jquery';
import 'ndarray';
import ResizeSensor from 'css-element-queries/src/ResizeSensor';
import remoteRenderer from './RemoteRenderer';
import vtkweb from './vtkweb';
import plotly from './plotly';
import cdms from './cdms';

const globalConnection = {};

function init(el, renderingType) {
  const connection = {};
  let backend = null;

  switch (renderingType) {
    case 'client':
      if (globalConnection.data === undefined) {
        // http@@@SECURE@@@://@@@URL@@@/data
        globalConnection.data = cdms.connect('http://localhost:8888/data');
      }
      connection.data = globalConnection.data;
      backend = plotly;
      break;
    case 'server':
    default:
      if (globalConnection.vtkweb === undefined) {
        globalConnection.vtkweb = vtkweb.connect('@@@URL@@@/ws');
      }
      connection.vtkweb = globalConnection.vtkweb;
      backend = vtkweb;
  }

  const canvas = {
    el,
    connection,
    backend,
    plot(dataSpec, method, template) {
      // Clean up inputs

      let spec = [];
      if (!Array.isArray(dataSpec)) {
        spec.push(dataSpec);
      } else {
        spec = dataSpec;
      }

      let tmpl = template;
      if (template === undefined) {
        tmpl = 'default';
      }
      if (this.insidePlot) {
        console.log('Ignore second plot calls made before windowId comes back to the client');
        return Promise.resolve();
      }
      return this.backend.plot(this, spec, tmpl, method);
    },
    clear() {
      this.backend.clear(this);
    },
    resize(width, height) {
      this.backend.resize(this, width, height);
    },
    close() {
      Object.keys(this.connection).map((k) => {
        return this.connection[k].then((c) => {
          return c.close(this);
        });
      });
    },
  };

  let resizeTimer = null;
  /* eslint-disable no-new */
  new ResizeSensor(el, () => {
    if (resizeTimer !== null) {
      clearTimeout(resizeTimer);
      resizeTimer = null;
    }
    resizeTimer = setTimeout(() => {
      const width = $(el).width();
      const height = $(el).height();
      canvas.resize(width, height);
      resizeTimer = null;
    }, 100);
  });
  return canvas;
}

export {
  init,
  remoteRenderer,
};
