import 'jquery';
import vtk from './vtk';
import plotly from './plotly';
import cdms from './cdms';


const globalClients = {};

function init(el, renderingType) {
  const clients = {};
  let backend = null;

  switch (renderingType) {
    case 'client':
      if (globalClients.data === undefined) {
        globalClients.data = cdms.connect('http@@@SECURE@@@://@@@URL@@@');
      }
      clients.data = globalClients.data;
      backend = plotly;
      break;
    case 'server':
      clients.vtk = vtk.init(el, 'ws@@@SECURE@@@://@@@URL@@@/ws');
      backend = vtk;
      break;
    default:
      // Fallback to vtk if they pass a bad renderingType.
      clients.vtk = vtk.init(el, 'ws@@@SECURE@@@://@@@URL@@@/ws');
      backend = vtk;
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

      this.backend.plot(this, spec, tmpl, method);
    },
    close() {
      Object.keys(this.clients).map((k) => { return this.clients[k].then((c) => { c.close(this); }); });
    },
  };
  return canvas;
}

export { init };

