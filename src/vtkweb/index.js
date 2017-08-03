import RemoteRenderer from 'ParaViewWeb/NativeUI/Canvas/RemoteRenderer';
import SizeHelper from 'ParaViewWeb/Common/Misc/SizeHelper';
import SmartConnect from 'ParaViewWeb/IO/WebSocket/SmartConnect';
import { createClient } from 'ParaViewWeb/IO/WebSocket/ParaViewWebClient';


const backend = {
  // RemoteRenderer associated with a windowId
  _renderer: {},
  connect(url) {
    const smartConnect = new SmartConnect({
      sessionURL: url,
    });

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
          if (canvas.canvasId) {
            canvas.el.innerHTML = '';
            canvas.el.removeEventListener('mousedown', this._renderer[canvas.windowId].mousedown);
            canvas.el.removeEventListener('mouseup', this._renderer[canvas.windowId].mouseup);
            this.pvw.session.call('vcs.canvas.close', [canvas.canvasId]);
            delete canvas.backend._renderer[canvas.windowId];
            canvas.canvasId = 0;
            canvas.windowId = 0;
          }
          return 0;
        },
      };
    });
    smartConnect.connect();
    return pvw;
  },
  plot(canvas, dataSpec, template, method) {
    canvas.insidePlot = true;
    return canvas.connection.vtkweb.then((connection) => {
      // dataSpec is either one or more variable objects (if more, they're in an array)
      let spec = [];

      if (!Array.isArray(dataSpec)) {
        spec.push(dataSpec);
      } else {
        spec = dataSpec;
      }
      const prevCanvasId = (canvas.canvasId !== undefined) ? canvas.canvasId : 0;
      const rendererPromise = connection.pvw.session.call(
        'vcs.canvas.plot',
        [prevCanvasId, spec, template, method, canvas.el.clientWidth, canvas.el.clientHeight]).then(([canvasId, windowId]) => {
          if (!prevCanvasId) {
            canvas.canvasId = canvasId;
            const renderer = new RemoteRenderer(connection.pvw, canvas.el, windowId);
            SizeHelper.onSizeChange(() => {
              renderer.resize();
            });
            SizeHelper.startListening();
            const render = () => renderer.render();
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
              const x = event.pageX - (element.getClientRects()[0].x || element.getClientRects()[0].left);
              const y = event.pageY - (element.getClientRects()[0].y || element.getClientRects()[0].top);
              return { x, y };
            };
            const mousedown = (e) => {
              const pos = getPosition(e, canvas.el);
              console.log('onmousedown render', pos.x, pos.y);
              const vtkEvent = getVtkEvent(pos.x, pos.y);
              vtkEvent.action = 'down';
              vtkEvent.buttonLeft = true;
              connection.pvw.MouseHandler.interaction(vtkEvent).then(render);
            };
            const mouseup = (e) => {
              const pos = getPosition(e, canvas.el);
              console.log('onmouseup render', pos.x, pos.y);
              const vtkEvent = getVtkEvent(pos.x, pos.y);
              vtkEvent.action = 'up';
              vtkEvent.buttonLeft = false;
              connection.pvw.MouseHandler.interaction(vtkEvent).then(render);
            };
            canvas.el.addEventListener('mousedown', mousedown);
            canvas.el.addEventListener('mouseup', mouseup);
            this._renderer[windowId] = { renderer, mousedown, mouseup, render };
            canvas.insidePlot = false;
            return renderer;
          }
          this._renderer[windowId].renderer.render(true);
          canvas.insidePlot = false;
          return this._renderer[windowId].renderer;
        });
      return rendererPromise.then((renderer) => {
        const imagePromise = new Promise((resolve, reject) => {
          renderer.onImageReady(resolve);
        });
        return imagePromise;
      });
    });
  },
  clear(canvas) {
    return canvas.connection.vtkweb.then((connection) => {
      if (canvas.canvasId) {
        canvas.el.innerHTML = '';
        canvas.el.removeEventListener('mousedown', this._renderer[canvas.windowId].mousedown);
        canvas.el.removeEventListener('mouseup', this._renderer[canvas.windowId].mouseup);
        connection.pvw.session.call('vcs.canvas.clear', [canvas.canvasId]);
      }
    });
  },
};

export { backend as default };
