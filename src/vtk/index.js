/* global document, WebSocket, ImageData */
import ResizeSensor from 'css-element-queries/src/ResizeSensor';
import $ from 'jquery';

const backend = {
  plot: (canvas, data, tmpl, gm) => {
    canvas.clients.vtk.send({ event: 'plot', data, gm, tmpl });
  },
  init: (el, url) => {
    const parent = el;
    const c = document.createElement('canvas');
    parent.appendChild(c);
    c.width = $(parent).width();
    c.height = $(parent).height();
    const socket = new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.binaryType = 'arraybuffer';
      ws.onopen = () => {
        resolve(ws);
      };
    });

    const context = c.getContext('2d');
    const targetDims = [];

    const send = (obj) => {
      socket.then((ws) => {
        ws.send(JSON.stringify(obj));
      });
    };

    const resize = (width, height) => {
      const intWidth = Math.floor(width);
      const intHeight = Math.floor(height);
      targetDims.push({ width: intWidth, height: intHeight });
      send({ event: 'resize', width: intWidth, height: intHeight });
    };

    socket.then((ws) => {
      ws.onmessage = (evt) => {
        let dims = targetDims.shift();
        if (dims === undefined) {
          dims = { width: c.width, height: c.height };
        }
        const buffer = new Uint8ClampedArray(evt.data);
        const img = new ImageData(buffer, dims.width, dims.height);
        c.width = dims.width;
        c.height = dims.height;
        context.putImageData(img, 0, 0);
      };
    });

    $(c).mousedown((ev) => {
      const { left, top } = $(c).offset();
      const evY = Math.floor(c.height - (ev.pageY - top));
      const evX = Math.floor(ev.pageX - left);
      send({ event: 'mouseDown', x: evX, y: evY });
    });

    $(c).mouseup((ev) => {
      const { left, top } = $(c).offset();
      const evY = Math.floor(c.height - (ev.pageY - top));
      const evX = Math.floor(ev.pageX - left);
      send({ event: 'mouseUp', x: evX, y: evY });
    });

    $(c).mousemove((ev) => {
      const { left, top } = $(c).offset();
      const evY = Math.floor(c.height - (ev.pageY - top));
      const evX = Math.floor(ev.pageX - left);
      send({ event: 'mouseMove', x: evX, y: evY });
    });

    // Sync initial canvas size
    resize(c.width, c.height);

    let resizeTimer = null;
    const sensor = new ResizeSensor(parent, () => {
      if (resizeTimer !== null) {
        clearTimeout(resizeTimer);
        resizeTimer = null;
      }
      resizeTimer = setTimeout(() => {
        const width = $(parent).width();
        const height = $(parent).height();
        resize(width, height);
        resizeTimer = null;
      }, 500);
    });

    return {
      send,
    };
  },
};

export { backend as default };
