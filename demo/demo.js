$(function () {
  // Ordinarily this would be a URL string of a rest
  // interface for generating a new server side connection.
  // Here we short circuit that code to generate a simulated
  // session connecting to pregenerated files through
  // Girder's rest interface.
  var url = 'ws://garant:8080/ws';

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
});
