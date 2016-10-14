import 'jquery';
import vtkweb from './vtkweb';
import plotly from './plotly';


const clients = {};

const obj = {
  init: (el) => {
    const canvas = {
      el,
      plot(dataSpec, template, method, renderingType) {
        switch (renderingType) {
          case 'client': {
            return plotly.plot(this, dataSpec, template, method);
          }
          case 'server': {
            if (clients.vtkweb === undefined) {
              clients.vtkweb = vtkweb.connect('@@@URL@@@');
            }
            return vtkweb.plot(this, dataSpec, template, method);
          }
          default: {
            return Promise.reject(new Error('Invalid renderingType'));
          }
        }
      },
      close() {
        Object.keys(clients).map((k) => { return clients[k].close(this); });
      },
    };
    return canvas;
  },
};

export { obj };
