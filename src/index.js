import 'jquery';
import vtkweb from './vtkweb';
import plotly from './plotly';
import cdms from './cdms';


const clients = {};

function init(el) {
  const canvas = {
    el,
    clients: {},
    plot(dataSpec, method, template, renderingType) {
      // Clean up inputs

      let spec = [];
      if (!Array.isArray(dataSpec)) {
        spec.push(dataSpec);
      } else {
        spec = dataSpec;
      }
      console.log(renderingType);
      let type = renderingType;
      if (renderingType === undefined) {
        type = 'server';
      }

      let tmpl = template;
      if (template === undefined) {
        tmpl = 'default';
      }

      switch (type) {
        case 'client': {
          if (clients.data === undefined) {
            clients.data = cdms.connect('http@@@SECURE@@@://@@@URL@@@');
          }
          this.clients.data = clients.data;
          return plotly.plot(this, spec, tmpl, method);
        }
        case 'server':
          if (clients.vtkweb === undefined) {
            clients.vtkweb = vtkweb.connect('ws@@@SECURE@@@://@@@URL@@@/ws');
          }
          this.clients.vtkweb = clients.vtkweb;
          return vtkweb.plot(this, spec, tmpl, method);
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

export { init };

