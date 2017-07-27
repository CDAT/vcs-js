import 'jquery';
import 'ndarray';
import remoteRenderer from './RemoteRenderer';
import vtkweb from './vtkweb';
import plotly from './plotly';
import cdms from './cdms';

const globalClients = {};

function init(el, renderingType) {
  const clients = {};
  let backend = null;

  switch (renderingType) {
    case 'client':
      if (globalClients.data === undefined) {
        // http@@@SECURE@@@://@@@URL@@@/data
        globalClients.data = cdms.connect('http://localhost:8888/data');
      }
      clients.data = globalClients.data;
      backend = plotly;
      break;
    case 'server':
      // // ws@@@SECURE@@@://@@@URL@@@/ws
      clients.vtkweb = vtkweb.connect('ws://localhost:9000/ws');
      backend = vtkweb;
      break;
    default:
      // Fallback to vtkweb if they pass a bad renderingType.
      // ws@@@SECURE@@@://@@@URL@@@/ws
      clients.vtkweb = vtkweb.connect('ws://localhost:9000/ws');
      backend = vtkweb;
  }

  const canvas = {
    el,
    clients,
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

      return this.backend.plot(this, spec, tmpl, method);
    },
    clear() {
      this.backend.clear(this);
    },
    close() {
      Object.keys(this.clients).map((k) => {
        return this.clients[k].then((c) => {
          return c.close(this);
        });
      });
    },
  };
  return canvas;
}

export {
  init,
  remoteRenderer,
};
