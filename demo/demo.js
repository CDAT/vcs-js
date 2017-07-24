$(function () {
  // Ordinarily this would be a URL string of a rest
  // interface for generating a new server side connection.
  // Here we short circuit that code to generate a simulated
  // session connecting to pregenerated files through
  // Girder's rest interface.
  var url = 'ws://localhost:9000/ws';

  var variables = {
    "clt": {"uri": "clt.nc", "variable": "clt"},
    "u": {"uri": "clt.nc", "variable": "u"},
    "v": {"uri": "clt.nc", "variable": "v"},
    "airt" : {"uri": "coads_climatology.nc", "variable": "AIRT"}
  }

  var boxfill = {"fillareaopacity": [], "datawc_timeunits": "days since 2000", "projection": "linear", "xticlabels1": "*", "xticlabels2": "*", "ymtics1": "", "ymtics2": "", "datawc_x1": 1e+20, "datawc_x2": 1e+20, "boxfill_type": "linear", "xmtics1": "", "fillareacolors": null, "xmtics2": "", "color_2": 255, "datawc_calendar": 135441, "fillareaindices": [1], "color_1": 0, "colormap": null, "missing": [0.0, 0.0, 0.0, 100.0], "xaxisconvert": "linear", "level_2": 1e+20, "ext_1": false, "ext_2": false, "datawc_y2": 1e+20, "datawc_y1": 1e+20, "yaxisconvert": "linear", "legend": null, "name": "__boxfill_717978942019492", "yticlabels1": "*", "yticlabels2": "*", "fillareastyle": "solid", "levels": [1e+20, 1e+20], "g_name": "Gfb", "level_1": 1e+20};
  var vector = {"datawc_timeunits": "days since 2000", "projection": "linear", "reference": 1e+20, "xticlabels1": "*", "xticlabels2": "*", "linecolor": null, "ymtics1": "", "ymtics2": "", "linewidth": null, "datawc_x1": 1e+20, "datawc_x2": 1e+20, "xmtics1": "", "xmtics2": "", "datawc_calendar": 135441, "alignment": "center", "type": "arrows", "colormap": null, "xaxisconvert": "linear", "scale": 1.0, "linetype": null, "datawc_y2": 1e+20, "datawc_y1": 1e+20, "yaxisconvert": "linear", "name": "vector_full", "yticlabels1": "*", "yticlabels2": "*", "scalerange": [0.1, 1.0], "scaleoptions": ["off", "constant", "normalize", "linear", "constantNNormalize", "constantNLinear"], "g_name": "Gv", "scaletype": "constantNNormalize"};
  var vector_subview = {"datawc_timeunits": "days since 2000", "projection": "linear", "reference": 1e+20, "xticlabels1": "*", "xticlabels2": "*", "linecolor": null, "ymtics1": "", "ymtics2": "", "linewidth": null, "datawc_x1": 60, "datawc_x2": 180, "xmtics1": "", "xmtics2": "", "datawc_calendar": 135441, "alignment": "center", "type": "arrows", "colormap": null, "xaxisconvert": "linear", "scale": 1.0, "linetype": null, "datawc_y2": 90, "datawc_y1": 0, "yaxisconvert": "linear", "name": "subset_vector", "yticlabels1": "*", "yticlabels2": "*", "scalerange": [0.1, 1.0], "scaleoptions": ["off", "constant", "normalize", "linear", "constantNNormalize", "constantNLinear"], "g_name": "Gv", "scaletype": "constantNNormalize"};
  var dv3d = {ScaleColormap: null, ScaleOpacity: null, BasemapOpacity: null, Camera: "{}", ZSlider: null, YSlider: null, ToggleVolumePlot: null, PointSize: null, Configure: null, XSlider: null, SliceThickness: null, axes: "xyz", plot_attributes: {name: "3d_scalar", template: "default"}, IsosurfaceValue: null, VerticalScaling: null, ChooseColormap: null, ToggleSurfacePlot: null, Colorbar: null, ncores: 8, ScaleTransferFunction: null, name: "default", ToggleClipping: null, Animation: null, g_name: "3d_scalar" };

  var canvas = vcs.init(document.getElementById('vcs-isofill'));

  // generate the plot when all of the promises resolve
  var dataSpec = variables.clt;
  canvas.plot(dataSpec, 'default', boxfill, 'server');

   // generate another plot using client side rendering
  // we don't have an api for getting data yet, so we'll
  // just use an ajax request to data.kitware.com
  var cltPromise = $.ajax('https://data.kitware.com/api/v1/file/576aa3c08d777f1ecd6701ae/download');
  var latPromise = $.ajax('https://data.kitware.com/api/v1/item/576aa3c08d777f1ecd6701b0/download');
  var lonPromise = $.ajax('https://data.kitware.com/api/v1/item/576aa3c08d777f1ecd6701b9/download');
  var canvas2 = vcs.init(document.getElementById('plotly-isofill'));

  // This is all very rough, likely much of this should be wrapped inside the api
  Promise.all([
    cltPromise, latPromise, lonPromise
  ]).then(function (arg) {
    var clt = arg[0];
    var lat = arg[1];
    var lon = arg[2];
    var timestep = 0;

    var data = {
      x: lon.data,
      y: lat.data
    };

    function draw() {
      data.z = ndarray(clt.data, clt.shape).pick(timestep, null, null);
      canvas2.plot(data, 'default', { "g_type": "Gfi" }, 'client');
      timestep = (timestep + 1) % clt.shape[0];
    }
    draw();
  });

  var canvas3 = vcs.init(document.getElementById('vcs-vector'));
    // generate the plot when all of the promises resolve
  var dataSpec = [variables.u, variables.v];
  canvas3.plot(dataSpec, 'default', vector, 'server');

  var canvas4 = vcs.init(document.getElementById('vcs-vector-subset'));

  // generate the plot when all of the promises resolve
  var dataSpec = [variables.u, variables.v];
  canvas4.plot(dataSpec, 'default', vector_subview, 'server');

  var canvas5 = vcs.init(document.getElementById('vcs3d'));

  // generate the plot when all of the promises resolve
  var dataSpec = variables.airt;
  canvas5.plot(dataSpec, 'default', dv3d, 'server');

  $(window).on('beforeunload', function() {
    canvas.close();
    canvas2.close();
    canvas3.close();
    canvas4.close();
    canvas5.close();
    return 'Your own message goes here...';
  });
});
