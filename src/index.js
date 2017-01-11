/* global document */

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

  // Emit events about plot status
  function plotStarted() {
    const ev = document.createEvent('Event');
    ev.initEvent('vcsPlotStart', true, true);
    el.dispatchEvent(ev);
  }

  function plotFinished() {
    const ev = document.createEvent('event');
    ev.initEvent('vcsPlotEnd', true, true);
    el.dispatchEvent(ev);
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
      plotStarted();
      const p = this.backend.plot(this, spec, tmpl, method);
      p.then(() => { plotFinished(); });
      return p;
    },
    clear() {
      this.backend.clear(this);
    },
    close() {
      Object.keys(this.clients).map((k) => { return Promise.resolve(this.clients[k]).then((c) => { c.close(this); }); });
    },
  };
  return canvas;
}

export { init };

