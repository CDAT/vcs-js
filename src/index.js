import 'jquery';
import 'ndarray';
import remoteRenderer from './RemoteRenderer';
import vtkweb from './vtkweb';
import plotly from './plotly';


const clients = {};

function init(el) {
  const canvas = {
    el,
    clients: {},
    plot(dataSpec, template, method, renderingType) {
      switch (renderingType) {
        case 'client': {
          return plotly.plot(this, dataSpec, template, method);
        }
        case 'server':
          if (clients.vtkweb === undefined) {
            clients.vtkweb = vtkweb.connect('@@@URL@@@/ws');
          }
          this.clients.vtkweb = clients.vtkweb;
          return vtkweb.plot(this, dataSpec, template, method);
        default:
          return Promise.reject(new Error('Invalid renderingType'));
      }
    },
    close() {
      Object.keys(this.clients).map((k) => { return this.clients[k].then((c) => { c.close(this); }); });
    },
  };
  return canvas;
}

export {
  init,
  remoteRenderer,
};
