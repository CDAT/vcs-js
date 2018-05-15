/* eslint-disable no-unused-vars */
import remoteRenderer from './RemoteRenderer';
import vtkweb from './vtkweb';
import plotly from './plotly';
import cdms from './cdms';
import config from './config';

const globalConnection = {};

function connect(renderingType) {
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
        globalConnection.vtkweb = vtkweb.connect(config.sessionUrl);
      }
      connection.vtkweb = globalConnection.vtkweb;
      backend = vtkweb;
  }

  return {
    connection,
    backend,
  };
}

function variables(fileName) {
  const { connection } = connect('server');
  return connection.vtkweb
    .then((client) => { return client.pvw.session.call('cdat.file.variables', [fileName]); });
}

function getvarinfofromfile(fileName, variableName=null) {
  const { connection } = connect('server');
  return connection.vtkweb
    .then((client) => { return client.pvw.session.call('cdat.file.var.info', [fileName, variableName]); });
}

function init(el, renderingType) {
  const { connection, backend } = connect(renderingType);

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
      return this.backend.plot(this, spec, method, tmpl);
    },

    clear() {
      return this.backend.clear(this);
    },

    resize(newWidth, newHeight) {
      el.style.width = `${newWidth}px`;
      el.style.height = `${newHeight}px`;
      return this.backend.resize(this, newWidth, newHeight);
    },

    // When this resolves, the result should contain some expected keys:
    //
    // {
    //   success: boolean (did screenshot succeed on server)
    //   msg: possible error message in case of failure
    //   type: same as "saveType" argument
    //   blob: A Blob containing the binary image data
    // }
    //
    screenshot(saveType = 'png', saveLocal = true, saveRemote = false,
               remotePath = null, width = null, height = null) {
      return this.backend.screenshot(this, saveType, saveLocal, saveRemote,
                                     remotePath, width, height);
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

// ======================================================================
// Colormap functionality

function getcolormapnames() {
  const { connection } = connect('server');
  return connection.vtkweb
    .then((client) => { return client.pvw.session.call('vcs.listelements', ['colormap']); });
}

function getcolormap(name) {
  const { connection } = connect('server');
  return connection.vtkweb
    .then((client) => {
      return client.pvw.session.call('vcs.getcolormap', [name]);
    });
}

function setcolormap(name, values) {
  const { connection } = connect('server');
  return connection.vtkweb
    .then((client) => {
      return client.pvw.session.call('vcs.setcolormap', [name, values]);
    });
}

function createcolormap(name, nameSource) {
  const { connection } = connect('server');
  return connection.vtkweb
    .then((client) => {
      return client.pvw.session.call('vcs.createcolormap', [name, nameSource]);
    });
}

function removecolormap(name) {
  const { connection } = connect('server');
  return connection.vtkweb
    .then((client) => {
      return client.pvw.session.call('vcs.removeelement', ['colormap', name]);
    });
}

// ======================================================================
// Graphics method functionality
function getgraphicsmethod(typeName, name) {
  const { connection } = connect('server');
  return connection.vtkweb
    .then((client) => {
      return client.pvw.session.call('vcs.getgraphicsmethod', [typeName, name]);
    });
}

/**
 * Creates a graphics method named 'name' (if 'name' is undefined it generates a name).
 * It copies all property values from 'nameSource' (nameSource is 'default' if not specified).
 */
function creategraphicsmethod(typeName, name, nameSource) {
  const { connection } = connect('server');
  return connection.vtkweb
    .then((client) => {
      return client.pvw.session.call('vcs.creategraphicsmethod', [typeName, name, nameSource]);
    });
}

function getgraphicsmethodnames(typeName) {
  const { connection } = connect('server');
  return connection.vtkweb
    .then((client) => { return client.pvw.session.call('vcs.listelements', [typeName]); });
}

function getgraphicsmethodtypes() {
  const { connection } = connect('server');
  return connection.vtkweb
    .then((client) => { return client.pvw.session.call('vcs.getgraphicsmethodtypes'); });
}

function getgraphicsmethodvariablecount(typeName) {
  const { connection } = connect('server');
  return connection.vtkweb
    .then((client) => { return client.pvw.session.call('vcs.getgraphicsmethodvariablecount', [typeName]); });
}

function setgraphicsmethod(typeName, name, nameValueMap) {
  const { connection } = connect('server');
  return connection.vtkweb
    .then((client) => {
      return client.pvw.session.call('vcs.setgraphicsmethod', [typeName, name, nameValueMap]);
    });
}

function removegraphicsmethod(typeName, name) {
  const { connection } = connect('server');
  return connection.vtkweb
    .then((client) => {
      return client.pvw.session.call('vcs.removeelement', [typeName, name]);
    });
}

export {
  init,
  variables,
  getvarinfofromfile,
  remoteRenderer,
  // Colormap functions
  getcolormapnames,
  getcolormap,
  setcolormap,
  createcolormap,
  removecolormap,
  // Graphics method functions
  getgraphicsmethodtypes,
  getgraphicsmethodvariablecount,
  getgraphicsmethodnames,
  getgraphicsmethod,
  setgraphicsmethod,
  creategraphicsmethod,
  removegraphicsmethod,
};
