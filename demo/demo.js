var canvas;
var renderer;

function vcs_boxfill_close()
{
  canvas.close();
}

function vcs_boxfill_clear()
{
  canvas.clear();
}

function vcs_boxfill_resize()
{
  canvas.el.style.height = '400px';
  renderer.resize();
  console.log('div resize');
}

/**
 * Prints the result from get_variables to the console.
 * @param {string? filename An absolute path to a netcdf file
 */
function print_variables (filename) {
  var varsPromise = vcs.variables(filename);
    var vars, axes, shape, axisList, lonLat, logString, boundsString,
        gridType;
    var v, i, al;
    varsPromise.then(
        function (varsAxes) {
            // variables
            vars = varsAxes[0];
            for (v in vars) {
                // shape of the variable
                shape = '(' + vars[v].shape[0];
                for (i = 1; i < vars[v].shape.length; ++i) {
                    shape += (',' + vars[v].shape[i]);
                }
                shape += ')';
                // axes for the variable
                al = vars[v].axisList;
                axisList = '(' + al[0];
                for (i = 1; i < al.length; ++i) {
                    axisList += (', ' + al[i]);
                }
                axisList += ')';
                // bounds are received for longitude and latitude
                boundsString = '';
                if (vars[v].bounds) {
                    boundsString += ': (' + vars[v].bounds[0] + ', ' +
                        vars[v].bounds[1] + ')';
                }
                // longitude, latitude for the variable
                // these are different than the axes for the curvilinear or
                // generic grids
                lonLat = null;
                if (vars[v].lonLat) {
                    lonLat = '(' + vars[v].lonLat[0] + ', ' +
                        vars[v].lonLat[1] + ')';
                }
                logString = v + shape + '[' + vars[v].name + ', ' +
                    vars[v].units + boundsString + ']' + ': ' + axisList;
                if (lonLat) {
                    logString += (', ' + lonLat);
                }
                if (vars[v].gridType) {
                    logString += (', ' + vars[v].gridType);
                }
                console.log(logString);
            }
            // all axes in the file
            axes = varsAxes[1];
            for (v in axes) {
                shape = '(' + axes[v].shape[0];
                for (i = 1; i < axes[v].shape.length; ++i) {
                    shape += (',' + axes[v].shape[i]);
                }
                shape += ')';
                console.log(v + shape + '[' + axes[v].name + ', ' +
                            axes[v].units + ': (' +
                            axes[v].data[0] + ', ' +
                            axes[v].data[axes[v].data.length - 1] + ')]');
            }
        },
        function (reason) {
            console.log(reason);
        }
    );
}

$(function () {
  operations = [{"subRegion": {'longitude1': [70, 180], 'latitude1': [0, 90]}},
                {"subSlice": {'longitude1': [null,null,2], 'latitude1': [null,null,2]}}];
  axis_order = [0, 1, 3, 2];
  var variables = {
    // unstructured grid
    "sample3": {"uri": "sampleGenGrid3.nc", "variable": "sample"},
    "sample3_subset": {"uri": "sampleGenGrid3.nc", "variable": "sample",
                       "operations": [{"subRegion": {"lon": [90, 150], "lat": [-60, 60]}}]},

    // curvilinear grid
    "sample4": {"uri": "sampleCurveGrid4.nc", "variable": "sample"},
    "sample4_subset": {"uri": "sampleCurveGrid4.nc", "variable": "sample",
                       "operations": [{"subRegion": {"lon": [60, 359.6620551632433], "lat": [-20, 88.64672617835618]}}]},

    "clt": {"uri": "clt.nc", "variable": "clt"},
    "u": {"uri": "clt.nc", "variable": "u"},
    "v": {"uri": "clt.nc", "variable": "v"},
    // execute a list of operations on the variable
    // for subSlice, null (or undefined) means the current value for being or end index
    "u_subset": {"uri": "clt.nc", "variable": "u",
                 "operations": operations, "axis_order": axis_order
                },
    "v_subset": {"uri": "clt.nc", "variable": "v",
                 "operations": operations, "axis_order": axis_order
                },

    "airt" : {"uri": "coads_climatology.nc", "variable": "AIRT"}
  }

  var boxfill = {"fillareaopacity": [], "datawc_timeunits": "days since 2000", "projection": "linear", "xticlabels1": "*", "xticlabels2": "*", "ymtics1": "", "ymtics2": "", "datawc_x1": 1e+20, "datawc_x2": 1e+20, "boxfill_type": "linear", "xmtics1": "", "fillareacolors": null, "xmtics2": "", "color_2": 255, "datawc_calendar": 135441, "fillareaindices": [1], "color_1": 0, "colormap": null, "missing": [0.0, 0.0, 0.0, 100.0], "xaxisconvert": "linear", "level_2": 1e+20, "ext_1": false, "ext_2": false, "datawc_y2": 1e+20, "datawc_y1": 1e+20, "yaxisconvert": "linear", "legend": null, "name": "__boxfill_717978942019492", "yticlabels1": "*", "yticlabels2": "*", "fillareastyle": "solid", "levels": [1e+20, 1e+20], "g_name": "Gfb", "level_1": 1e+20};
  var vector =         {"datawc_timeunits": "days since 2000", "projection": "linear", "reference": 1e+20, "xticlabels1": "*", "xticlabels2": "*", "linecolor": null, "ymtics1": "", "ymtics2": "", "linewidth": null, "datawc_x1": 1e+20, "datawc_x2": 1e+20, "xmtics1": "", "xmtics2": "", "datawc_calendar": 135441, "alignment": "center", "type": "arrows", "colormap": null, "xaxisconvert": "linear", "scale": 1.0, "linetype": null, "datawc_y2": 1e+20, "datawc_y1": 1e+20, "yaxisconvert": "linear", "name": "vector_full",   "yticlabels1": "*", "yticlabels2": "*", "scalerange": [0.1, 1.0], "scaleoptions": ["off", "constant", "normalize", "linear", "constantNNormalize", "constantNLinear"], "g_name": "Gv", "scaletype": "constantNNormalize"};
  var vector_subview = {"datawc_timeunits": "days since 2000", "projection": "linear", "reference": 1e+20, "xticlabels1": "*", "xticlabels2": "*", "linecolor": null, "ymtics1": "", "ymtics2": "", "linewidth": null, "datawc_x1": 60,    "datawc_x2": 180,   "xmtics1": "", "xmtics2": "", "datawc_calendar": 135441, "alignment": "center", "type": "arrows", "colormap": null, "xaxisconvert": "linear", "scale": 1.0, "linetype": null, "datawc_y2": 90,    "datawc_y1": 0,     "yaxisconvert": "linear", "name": "subset_vector", "yticlabels1": "*", "yticlabels2": "*", "scalerange": [0.1, 1.0], "scaleoptions": ["off", "constant", "normalize", "linear", "constantNNormalize", "constantNLinear"], "g_name": "Gv", "scaletype": "constantNNormalize"};
  var isofill = {"g_name": "Gfi"};
  var meshfill = {"g_name": "Gfm"};
  var dv3d = {ScaleColormap: null, ScaleOpacity: null, BasemapOpacity: null, Camera: "{}", ZSlider: null, YSlider: null, ToggleVolumePlot: null, PointSize: null, Configure: null, XSlider: null, SliceThickness: null, axes: "xyz", plot_attributes: {name: "3d_scalar", template: "default"}, IsosurfaceValue: null, VerticalScaling: null, ChooseColormap: null, ToggleSurfacePlot: null, Colorbar: null, ncores: 8, ScaleTransferFunction: null, name: "default", ToggleClipping: null, Animation: null, g_name: "3d_scalar" };

  var dataSpec = variables.clt;
  canvas = vcs.init(document.getElementById('vcs-boxfill'));
  var rendererPromise = canvas.plot(dataSpec, boxfill);
  rendererPromise.then((r) => {
    renderer = r;
    renderer.onImageReady(() => {
      console.log("Ready1");
    });

    // // what if we want to plot over the first plot
    // var dataSpec = [variables.u, variables.v];
    // var rendererPromise2 = canvas.plot(dataSpec, vector);
    // rendererPromise2.then((r) => {
    //   r.onImageReady(() => {
    //     console.log("Ready2");
    //   });
    // });
  });
  // call canvas.plot quickly, before the canvasId arrives back from the client.
  // this is ignored.
  canvas.plot(dataSpec, boxfill);

  // var canvas2 = vcs.init(document.getElementById('plotly-isofill'));
  // canvas2.plot(dataSpec, isofill, 'default', 'client');

  var canvas3 = vcs.init(document.getElementById('vcs-vector'));
  var dataSpec = [variables.u, variables.v];
  canvas3.plot(dataSpec, vector);

  var canvas4 = vcs.init(document.getElementById('vcs-vector-subset'));
  var dataSpec = [variables.u, variables.v];
  canvas4.plot(dataSpec, vector_subview);

  var canvas5 = vcs.init(document.getElementById('vcs3d'));
  var dataSpec = variables.airt;
  canvas5.plot(dataSpec, dv3d, 'default');

  var canvas6 = vcs.init(document.getElementById('vcs-vector-subset-cdms'));
  var dataSpec = [variables.u_subset, variables.v_subset];
  canvas6.plot(dataSpec, vector);

  // unstructured grid
  var canvas7 = vcs.init(document.getElementById('vcs-meshfill3'));
  var dataSpec = variables.sample3;
  canvas7.plot(dataSpec, meshfill);

  var canvas8 = vcs.init(document.getElementById('vcs-meshfill3-subset'));
  var dataSpec = variables.sample3_subset;
  canvas8.plot(dataSpec, meshfill);

  // curvilinear grid
  var canvas9 = vcs.init(document.getElementById('vcs-meshfill4'));
  var dataSpec = variables.sample4;
  canvas9.plot(dataSpec, meshfill);

  var canvas10 = vcs.init(document.getElementById('vcs-meshfill4-subset'));
  var dataSpec = variables.sample4_subset;
  canvas10.plot(dataSpec, meshfill);
});
