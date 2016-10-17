import Promise from 'bluebird';

const vtkwebInjector = require('inject!vcs/vtkweb');

describe('vtkweb', () => {
  it('dispatch', () => {
    const remoteRenderer = {
      setContainer: sinon.stub(),
      resize: sinon.stub(),
    };
    const createRemoteRenderer = sinon.stub().returns(remoteRenderer);
    const onSizeChange = sinon.stub();
    const startListening = sinon.stub();
    const client = {};
    const canvas = {
      session: {
        client: () => Promise.resolve(client),
      },
      el: 'el',
    };

    /* eslint-disable */
    const fileURI = __dirname + "/../../clt.nc";
    const clt = {"id": "clt", "derivation": [{"type": "file", "uri": fileURI}, {"parents": [0], "operation": {"type": "get", "id": "clt"}, "type": "variable"}]};
    /* eslint-enable */

    const remoteRender = vtkwebInjector({
      'ParaViewWeb/NativeUI/Canvas/RemoteRenderer': createRemoteRenderer,
      'ParaViewWeb/Common/Misc/SizeHelper': { onSizeChange, startListening },
    }).default;

    const gm = {
      g_name: 'Gfb',
      level_1: 0,
      level_2: 50,
    };

    return remoteRender(canvas, clt, gm)
      .then(() => {
        sinon.assert.calledOnce(createRemoteRenderer);
        sinon.assert.calledWith(createRemoteRenderer, client);

        sinon.assert.calledOnce(remoteRenderer.setContainer);
        sinon.assert.calledWith(remoteRenderer.setContainer, 'el');

        sinon.assert.calledOnce(startListening);
        sinon.assert.calledOnce(onSizeChange);

        onSizeChange.getCall(0).args[0]();
        sinon.assert.calledOnce(remoteRenderer.resize);
      });
  });
});
