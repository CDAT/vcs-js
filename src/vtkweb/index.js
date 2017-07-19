import RemoteRenderer from 'ParaViewWeb/NativeUI/Canvas/RemoteRenderer';
import SizeHelper from 'ParaViewWeb/Common/Misc/SizeHelper';
/**
 * BEGIN simplified interface
 * @param {string} dataSpec.file  data file where to read the variables from
 * @param {string} dataSpec.variable variable or list of variables to plot (from dataSpec.file)
 * @param {object} dataSpec.subset same as subset in dataSpec.variables.
 *                 Subset is applied to all variables, so we assume
 *                 all variables have the same grid.
 * END simplified interface
 * @param {object[]} dataSpec.variables       The variable from the file to display
 *        A variable contains:
 *          - name: the name of the attribute to plot
 *          - file: the data file where to read the variable from
 *          - subset: a list of dictionary elements, each element has
 *              - name: index variable name
 *              - range: list with lower and upper range for the index varia
 */
export default function remoteRender(canvas, dataSpec, template, method) {
  return canvas.session.client()
    .then((client) => {
      // dataSpec is either one or more variable objects (if more, they're in an array)
      let spec = [];

      if (!Array.isArray(dataSpec)) {
        spec.push(dataSpec);
      } else {
        spec = dataSpec;
      }
      client.session.call(
        'cdat.view.create',
        [dataSpec.variables, template, method]).then((windowId) => {
          canvas.windowId = windowId;
          const renderer = new RemoteRenderer(client, canvas.el, windowId);
          SizeHelper.onSizeChange(() => {
            renderer.resize();
          });
          SizeHelper.startListening();
          return renderer;
        });
    });
}
