import RemoteRenderer from 'ParaViewWeb/NativeUI/Canvas/RemoteRenderer';
import SizeHelper from 'ParaViewWeb/Common/Misc/SizeHelper';
import SmartConnect from 'wslink/src/SmartConnect';
import { createClient } from 'ParaViewWeb/IO/WebSocket/ParaViewWebClient';


const backend = {
  // RemoteRenderer associated with a windowId
  _renderer: {},
  connect(url) {
    const config = { sessionURL: url };
    const smartConnect = SmartConnect.newInstance({ config });

    const connectionPromise = new Promise((resolve, reject) => {
      smartConnect.onConnectionReady(resolve);
      smartConnect.onConnectionError(reject);
      smartConnect.onConnectionClose(reject);
    });

    // create a pvw client object after the session is ready
    const pvw = connectionPromise.then((connection) => {
      const handlers = ['MouseHandler', 'ViewPort', 'ViewPortImageDelivery', 'FileListing'];
      return {
        pvw: createClient(connection, handlers),
        close(canvas) {
          if (! canvas.windowId) {
            return Promise.resolve(0);
          }
          canvas.el.innerHTML = '';
          canvas.el.removeEventListener('mousedown', canvas.backend._renderer[canvas.windowId].mousedown);
          canvas.el.removeEventListener('mouseup', canvas.backend._renderer[canvas.windowId].mouseup);
          const closePromise = this.pvw.session.call('vcs.canvas.close', [canvas.windowId]);
          delete canvas.backend._renderer[canvas.windowId];
          canvas.windowId = 0;
          return closePromise;
        },
      };
    });
    smartConnect.connect();
    return pvw;
  },
  plot(canvas, dataSpec, method, template) {
    canvas.insidePlot = true;
    return canvas.connection.vtkweb.then((client) => {
      // dataSpec is either one or more variable objects (if more, they're in an array)
      let spec = [];

      if (!Array.isArray(dataSpec)) {
        spec.push(dataSpec);
      } else {
        spec = dataSpec;
      }
      const prevWindowId = (canvas.windowId !== undefined) ? canvas.windowId : 0;
      const rendererPromise = client.pvw.session.call(
        'vcs.canvas.plot',
        [prevWindowId, spec, method, template, canvas.el.clientWidth, canvas.el.clientHeight]).then(([windowId]) => {
          if (!prevWindowId) {
            canvas.windowId = windowId;
            const renderer = new RemoteRenderer(client.pvw, canvas.el, windowId);
            SizeHelper.onSizeChange(() => {
              console.log('renderer.resize');
              renderer.resize();
            });
            SizeHelper.startListening();
            const render = () => renderer.render(true);
            const getVtkEvent = (x, y) => {
              const vtkEvent = {
                view: windowId,
                buttonLeft: true,
                buttonMiddle: false,
                buttonRight: false,
                /* eslint-disable no-bitwise */
                shiftKey: false,
                ctrlKey: false,
                altKey: false,
                metaKey: false,
                /* eslint-enable no-bitwise */
                x: x / canvas.el.clientWidth,
                y: 1.0 - (y / canvas.el.clientHeight),
                action: 'down',
              };
              return vtkEvent;
            };
            const getPosition = (event, element) => {
              const x = event.clientX - (element.getClientRects()[0].x || element.getClientRects()[0].left);
              const y = event.clientY - (element.getClientRects()[0].y || element.getClientRects()[0].top);
              return { x, y };
            };
            const mousedown = (e) => {
              const pos = getPosition(e, canvas.el);
              const vtkEvent = getVtkEvent(pos.x, pos.y);
              vtkEvent.action = 'down';
              vtkEvent.buttonLeft = true;
              client.pvw.MouseHandler.interaction(vtkEvent).then(render);
            };
            const mouseup = (e) => {
              const pos = getPosition(e, canvas.el);
              const vtkEvent = getVtkEvent(pos.x, pos.y);
              vtkEvent.action = 'up';
              vtkEvent.buttonLeft = false;
              client.pvw.MouseHandler.interaction(vtkEvent).then(render);
            };
            canvas.el.addEventListener('mousedown', mousedown);
            canvas.el.addEventListener('mouseup', mouseup);
            this._renderer[windowId] = { renderer, mousedown, mouseup };
            canvas.insidePlot = false;
            return renderer;
          }
          this._renderer[windowId].renderer.render(true);
          canvas.insidePlot = false;
          return this._renderer[windowId].renderer;
        });
      return rendererPromise;
    });
  },
  clear(canvas) {
    if (!canvas.windowId) {
      return Promise.resolve(false);
    }
    return canvas.connection.vtkweb.then((client) => {
      canvas.el.innerHTML = '';
      canvas.el.removeEventListener('mousedown', this._renderer[canvas.windowId].mousedown);
      canvas.el.removeEventListener('mouseup', this._renderer[canvas.windowId].mouseup);
      return client.pvw.session.call('vcs.canvas.clear', [canvas.windowId]);
    });
  },
  resize(canvas, newWidth, newHeight) {
    if (!canvas.windowId) {
      return Promise.resolve(false);
    }
    return canvas.connection.vtkweb.then((client) => {
      return client.pvw.session.call('vcs.canvas.resize', [canvas.windowId, newWidth, newHeight]).then(() => {
        this._renderer[canvas.windowId].renderer.resize();
      });
    });
  },
};

export { backend as default };
