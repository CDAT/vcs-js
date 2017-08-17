import SmartConnect from 'wslink/src/SmartConnect';
import { createClient } from 'ParaViewWeb/IO/WebSocket/ParaViewWebClient';
import RemoteRenderer from 'ParaViewWeb/NativeUI/Canvas/RemoteRenderer';
import SizeHelper from 'ParaViewWeb/Common/Misc/SizeHelper';


export default (canvas, window) => {
  const config = { sessionURL: 'ws://localhost:1234/ws' };
  const smartConnect = SmartConnect.newInstance({ config });
  smartConnect.onConnectionReady((connection) => {
    const pvwClient = createClient(connection, ['MouseHandler', 'ViewPort', 'ViewPortImageDelivery', 'FileListing']);
    const renderer = new RemoteRenderer(pvwClient);
    console.log('SizeHelper.setContainer');
    renderer.setContainer(canvas);
    renderer.onImageReady(() => {
      console.log('We are good');
    });
    console.log('window.renderer');
    window.renderer = renderer;
    const onsizechanged = (() => {
      console.log('SizeHelper.onSizeChange()');
      renderer.resize();
    });
    SizeHelper.onSizeChange(onsizechanged);
    console.log('listServerDirectory');
    pvwClient.FileListing.listServerDirectory('.').then((filesObject) => {
      console.log(filesObject);
    });
    console.log('SizeHelper.startListening()');
    SizeHelper.startListening();
  });
  smartConnect.connect();
};
