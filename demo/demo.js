$(function () {
  // Ordinarily this would be a URL string of a rest
  // interface for generating a new server side connection.
  // Here we short circuit that code to generate a simulated
  // session connecting to pregenerated files through
  // Girder's rest interface.
  var url = {
    girder: 'https://data.kitware.com/api/v1',
    folder: '576aa3958d777f1ecd6701a7'
  };

  // create the session
  var sessionPromise = vcs.createSession(url);
  
  // create the canvas
  var canvasPromise = sessionPromise.then(function (session) {
    return vcs.init(document.getElementById('vcs-plot'), session);
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
    // get the file object for clt
    var clt = files.filter(function (f) { return f.fileName === 'clt.json'; })[0];

    // read the data from clt.json
    return clt.createData();
  });

  // get the data object for the latitude variable
  var latitudePromise = sessionPromise.then(function (session) {
    return session.files();
  }).then(function (files) {
    var latitude = files.filter(function (f) { return f.fileName === 'latitude.json'; })[0];

    // read the data from clt.json
    return latitude.createData();
  });

  // get the data object for the longitude variable
  var longitudePromise = sessionPromise.then(function (session) {
    return session.files();
  }).then(function (files) {
    // get the file object for longitude
    var longitude = files.filter(function (f) { return f.fileName === 'longitude.json'; })[0];

    // read the data from clt.json
    return longitude.createData();
  });

  // generate the plot when all of the promises resolve
  Promise.all([
   canvasPromise, gmPromise, cltPromise, latitudePromise, longitudePromise
  ]).then(function (arg) {
    var canvas = arg[0];
    var gm = arg[1];
    var clt = arg[2];
    var latitude = arg[3].data;
    var longitude = arg[4].data;
    var timeStep = 0;

    data = {
      x: longitude,
      y: latitude
    };

    // draw a time slice of the data
    function draw() {
      data.z = clt.data.pick(timeStep, null, null);
      canvas.plot(data, gm, 'default', 'webgl');
      timeStep = (timeStep + 1) % clt.data.shape[0];
    }

    // extract time slices and animate the plot
    window.setInterval(() => draw(), 2000);
  });
});
