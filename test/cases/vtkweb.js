import Promise from 'vcs/promise';
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

    const remoteRender = vtkwebInjector({
      'ParaViewWeb/NativeUI/Canvas/RemoteRenderer': createRemoteRenderer,
      'ParaViewWeb/Common/Misc/SizeHelper': { onSizeChange, startListening },
    }).default;

    return remoteRender(canvas, 'data', 'gm', 't')
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
