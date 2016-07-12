import RemoteRenderer from 'ParaViewWeb/NativeUI/Canvas/RemoteRenderer';
import { onSizeChange, startListening } from 'ParaViewWeb/Common/Misc/SizeHelper';

export default function remoteRender(canvas, dataObject, graphicsMethod, template) {
  return canvas.session.client()
    .then((client) => {
      const renderer = new RemoteRenderer(client);
      renderer.setContainer(canvas.el);
      onSizeChange(() => {
        renderer.resize();
      });
      startListening();
    });
}
