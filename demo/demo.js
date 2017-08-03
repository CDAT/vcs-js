var canvas;

function vcs_boxfill_close()
{
  canvas.close();
}

function vcs_boxfill_clear()
{
  canvas.clear();
}

$(function () {
  var variables = {
    "clt": {"uri": "clt.nc", "variable": "clt"},
    "u": {"uri": "clt.nc", "variable": "u"},
    "v": {"uri": "clt.nc", "variable": "v"},
    "airt" : {"uri": "coads_climatology.nc", "variable": "AIRT"}
  }

  var boxfill = {"fillareaopacity": [], "datawc_timeunits": "days since 2000", "projection": "linear", "xticlabels1": "*", "xticlabels2": "*", "ymtics1": "", "ymtics2": "", "datawc_x1": 1e+20, "datawc_x2": 1e+20, "boxfill_type": "linear", "xmtics1": "", "fillareacolors": null, "xmtics2": "", "color_2": 255, "datawc_calendar": 135441, "fillareaindices": [1], "color_1": 0, "colormap": null, "missing": [0.0, 0.0, 0.0, 100.0], "xaxisconvert": "linear", "level_2": 1e+20, "ext_1": false, "ext_2": false, "datawc_y2": 1e+20, "datawc_y1": 1e+20, "yaxisconvert": "linear", "legend": null, "name": "__boxfill_717978942019492", "yticlabels1": "*", "yticlabels2": "*", "fillareastyle": "solid", "levels": [1e+20, 1e+20], "g_name": "Gfb", "level_1": 1e+20};
  var vector = {"datawc_timeunits": "days since 2000", "projection": "linear", "reference": 1e+20, "xticlabels1": "*", "xticlabels2": "*", "linecolor": null, "ymtics1": "", "ymtics2": "", "linewidth": null, "datawc_x1": 1e+20, "datawc_x2": 1e+20, "xmtics1": "", "xmtics2": "", "datawc_calendar": 135441, "alignment": "center", "type": "arrows", "colormap": null, "xaxisconvert": "linear", "scale": 1.0, "linetype": null, "datawc_y2": 1e+20, "datawc_y1": 1e+20, "yaxisconvert": "linear", "name": "vector_full", "yticlabels1": "*", "yticlabels2": "*", "scalerange": [0.1, 1.0], "scaleoptions": ["off", "constant", "normalize", "linear", "constantNNormalize", "constantNLinear"], "g_name": "Gv", "scaletype": "constantNNormalize"};
  var vector_subview = {"datawc_timeunits": "days since 2000", "projection": "linear", "reference": 1e+20, "xticlabels1": "*", "xticlabels2": "*", "linecolor": null, "ymtics1": "", "ymtics2": "", "linewidth": null, "datawc_x1": 60, "datawc_x2": 180, "xmtics1": "", "xmtics2": "", "datawc_calendar": 135441, "alignment": "center", "type": "arrows", "colormap": null, "xaxisconvert": "linear", "scale": 1.0, "linetype": null, "datawc_y2": 90, "datawc_y1": 0, "yaxisconvert": "linear", "name": "subset_vector", "yticlabels1": "*", "yticlabels2": "*", "scalerange": [0.1, 1.0], "scaleoptions": ["off", "constant", "normalize", "linear", "constantNNormalize", "constantNLinear"], "g_name": "Gv", "scaletype": "constantNNormalize"};
  var isofill = {"g_name": "Gfi"};
  var dv3d = {ScaleColormap: null, ScaleOpacity: null, BasemapOpacity: null, Camera: "{}", ZSlider: null, YSlider: null, ToggleVolumePlot: null, PointSize: null, Configure: null, XSlider: null, SliceThickness: null, axes: "xyz", plot_attributes: {name: "3d_scalar", template: "default"}, IsosurfaceValue: null, VerticalScaling: null, ChooseColormap: null, ToggleSurfacePlot: null, Colorbar: null, ncores: 8, ScaleTransferFunction: null, name: "default", ToggleClipping: null, Animation: null, g_name: "3d_scalar" };

  var dataSpec = variables.clt;

  canvas = vcs.init(document.getElementById('vcs-boxfill'));
  var imagePromise = canvas.plot(dataSpec, boxfill);
  imagePromise.then(() => {
    console.log("Ready1");
    // what if we want to plot over the first plot
    var dataSpec = [variables.u, variables.v];
    var imagePromise2 = canvas.plot(dataSpec, vector);
    imagePromise.then(() => {
      console.log("Ready2");
    });
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
  canvas5.plot(dataSpec, dv3d, 'default', 'server');
});
