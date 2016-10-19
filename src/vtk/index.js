/* global document, WebSocket, ImageData */
import onResize from 'element-resize-event';

const backend = {
  plot: (canvas, data, tmpl, gm) => {
    canvas.clients.vtk.send({ event: 'plot', data, gm, tmpl });
  },
  init: (el, url) => {
    const parent = el;
    const c = document.createElement('canvas');
    parent.appendChild(c);
    c.width = parent.offsetWidth;
    c.height = parent.offsetHeight;
    const socket = new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.binaryType = 'arraybuffer';
      ws.onopen = () => {
        resolve(ws);
      };
    });

    const context = c.getContext('2d');

    const send = (obj) => {
      socket.then((ws) => {
        ws.send(JSON.stringify(obj));
      });
    };

    socket.then((ws) => {
      ws.onmessage = (evt) => {
        const buffer = new Uint8ClampedArray(evt.data);
        const img = new ImageData(buffer, c.width, c.height);
        context.putImageData(img, 0, 0);
      };
    });

    send({ event: 'resize', width: c.width, height: c.height });

    let resizeTimer = null;

    onResize(parent, () => {
      const sizeChanged = c.width !== parent.offsetWidth || c.height !== parent.offsetHeight;
      if (sizeChanged) {
        if (resizeTimer !== null) {
          clearTimeout(resizeTimer);
        }
        c.width = parent.offsetWidth;
        c.height = parent.offsetHeight;
        setTimeout(() => {
          send({ event: 'resize', width: c.width, height: c.height });
          resizeTimer = null;
        }, 100);
      }
    });
    return {
      send,
    };
  },
};

export { backend as default };
