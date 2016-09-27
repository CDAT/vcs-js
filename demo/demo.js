$(function () {
  // Ordinarily this would be a URL string of a rest
  // interface for generating a new server side connection.
  // Here we short circuit that code to generate a simulated
  // session connecting to pregenerated files through
  // Girder's rest interface.
  var url = 'ws://localhost:9000/ws';

  // create the session
  var sessionPromise = vcs.createSession(url);

  sessionPromise.catch(() => {
    console.log('Could not connect to ' + url);
  });

  // create the canvas
  var canvasPromise = sessionPromise.then(function (session) {
    return vcs.init(document.getElementById('vcs-plot-1'), session);
  });

  // create the graphics method
  var gmPromise = canvasPromise.then(function (canvas) {
    // create a graphics method
    return canvas.create('isofill', '¯\_(ツ)_/¯')
  });

  // get the data object for the clt variable
  var cltPromise = sessionPromise.then(function (session) {
    return session.files();
  }).then(function (files) {
    // print the list of files
    console.log(files.map((f) => f.fileName));

    // get the file object for a netcdf variable
    var nc = files.filter(function (f) { return f.fileName.match(/\.nc$/); })[0];

    if (!nc) {
      console.log('No netcdf variables found');
      return;
    }

    // get a list of variables
    return nc.variables();
  }).then(function (variables) {
    console.log(variables);
  });

  // generate the plot when all of the promises resolve
  Promise.all([
   canvasPromise, gmPromise, cltPromise
  ]).then(function (arg) {
    var canvas = arg[0];
    var gm = arg[1];
    var clt = arg[2];

    canvas.plot(clt, gm, 'default', 'vtkweb');
  });

  // generate another plot using client side rendering
  // we don't have an api for getting data yet, so we'll
  // just use an ajax request to data.kitware.com
  var cltPromise = $.ajax('https://data.kitware.com/api/v1/file/576aa3c08d777f1ecd6701ae/download');
  var latPromise = $.ajax('https://data.kitware.com/api/v1/item/576aa3c08d777f1ecd6701b0/download');
  var lonPromise = $.ajax('https://data.kitware.com/api/v1/item/576aa3c08d777f1ecd6701b9/download');
  var canvasPromise2 = sessionPromise.then(function (session) {
    return vcs.init(document.getElementById('vcs-plot-2'), session);
  });


  // This is all very rough, likely much of this should be wrapped inside the api
  Promise.all([
    canvasPromise2, gmPromise, cltPromise, latPromise, lonPromise
  ]).then(function (arg) {
    var canvas = arg[0];
    var gm = arg[1];
    var clt = arg[2];
    var lat = arg[3];
    var lon = arg[4];
    var timestep = 0;

    var data = {
      x: lon.data,
      y: lat.data
    };

    function draw() {
      data.z = ndarray(clt.data, clt.shape).pick(timestep, null, null);
      canvas.plot(data, gm, 'default', 'webgl');
      timestep = (timestep + 1) % clt.shape[0];
    }

    // call again for the next time step
    draw();
  });
});
