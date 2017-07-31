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
            this.pvw.session.call('vcs.canvas.close', [canvas.canvasId]);
            delete canvas.backend._renderer.windowId;
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
        [prevCanvasId, spec, template, method]).then(([canvasId, windowId]) => {
          if (!prevCanvasId) {
            canvas.canvasId = canvasId;
            const renderer = new RemoteRenderer(connection.pvw, canvas.el, windowId);
            SizeHelper.onSizeChange(() => {
              renderer.resize();
            });
            SizeHelper.startListening();
            this._renderer.windowId = renderer;
            canvas.insidePlot = false;
            return renderer;
          }
          canvas.insidePlot = false;
          return this._renderer.windowId;
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
        connection.pvw.session.call('vcs.canvas.clear', [canvas.canvasId]);
      }
    });
  },
};

export { backend as default };
