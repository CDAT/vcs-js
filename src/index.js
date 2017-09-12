/* eslint-disable no-unused-vars */
import $ from 'jquery';
import 'ndarray';
import remoteRenderer from './RemoteRenderer';
import vtkweb from './vtkweb';
import plotly from './plotly';
import cdms from './cdms';

const globalConnection = {};

function connect(renderingType) {
  const connection = {};

  switch (renderingType) {
    case 'client':
      if (globalConnection.data === undefined) {
        // http@@@SECURE@@@://@@@URL@@@/data
        globalConnection.data = cdms.connect('http://localhost:8888/data');
      }
      connection.data = globalConnection.data;
      break;
    case 'server':
    default:
      if (globalConnection.vtkweb === undefined) {
        globalConnection.vtkweb = vtkweb.connect('@@@URL@@@/ws');
      }
      connection.vtkweb = globalConnection.vtkweb;
  }
  return connection;
}

function variables(fileName) {
  const connection = connect('server');
  return connection.vtkweb
    .then((client) => { return client.pvw.session.call('cdat.file.variables', [fileName]); });
}

function init(el, renderingType) {
  const connection = connect(renderingType);
  let backend = null;
  switch (renderingType) {
    case 'client':
      backend = plotly;
      break;
    case 'server':
    default:
      backend = vtkweb;
  }

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
        // Ignore second plot calls made before windowId comes back to the client
        return Promise.resolve();
      }
      return this.backend.plot(this, spec, tmpl, method);
    },

    clear() {
      this.backend.clear(this);
    },

    close() {
      Object.keys(this.connection).map((k) => {
        return this.connection[k].then((c) => {
          return c.close(this);
        });
      });
    },
  };
  return canvas;
}

export {
  init,
  variables,
  remoteRenderer,
};
