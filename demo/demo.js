var sessionPromise;

$(function () {    
  // Ordinarily this would be a URL string of a rest
  // interface for generating a new server side connection.
  // Here we short circuit that code to generate a simulated
  // session connecting to pregenerated files through
  // Girder's rest interface.
  var url = 'ws://localhost:9000/ws';

  var variables = {
    "SST": {"id": "SST", "derivation": [{"type": "file", "uri": "coads_climatology.nc"}, {"parents": [0], "operation": {"type": "get", "id": "SST"}, "type": "variable"}, {"parents": [1], "operation": {"grid": null, "squeeze": 0, "type": "subset", "axes": {"COADSX": [21.0, 379.0], "COADSY": [-89.0, 89.0], "TIME": ["0-1-16 6:0:0.0", "0-12-16 1:20:6.0"]}, "order": null}, "type": "variable"}]},
    "UWND": {"id": "UWND", "derivation": [{"type": "file", "uri": "coads_climatology.nc"}, {"parents": [0], "operation": {"type": "get", "id": "UWND"}, "type": "variable"}, {"parents": [1], "operation": {"grid": null, "squeeze": 0, "type": "subset", "axes": {"COADSX": [21.0, 379.0], "COADSY": [-89.0, 89.0], "TIME": ["0-1-16 6:0:0.0", "0-12-16 1:20:6.0"]}, "order": null}, "type": "variable"}]},
    "VWND": {"id": "VWND", "derivation": [{"type": "file", "uri": "coads_climatology.nc"}, {"parents": [0], "operation": {"type": "get", "id": "VWND"}, "type": "variable"}, {"parents": [1], "operation": {"grid": null, "squeeze": 0, "type": "subset", "axes": {"COADSX": [21.0, 379.0], "COADSY": [-89.0, 89.0], "TIME": ["0-1-16 6:0:0.0", "0-12-16 1:20:6.0"]}, "order": null}, "type": "variable"}]},
    "UWND_sub": {"id": "UWND_sub", "derivation": [{"type": "file", "uri": "coads_climatology.nc"}, {"parents": [0], "operation": {"type": "get", "id": "UWND"}, "type": "variable"}, {"parents": [1], "operation": {"grid": null, "squeeze": 0, "type": "subset", "axes": {"COADSX": [60.0, 180.0], "COADSY": [0, 90], "TIME": ["0-1-16 6:0:0.0", "0-12-16 1:20:6.0"]}, "order": null}, "type": "variable"}]},
    "VWND_sub": {"id": "VWND_sub", "derivation": [{"type": "file", "uri": "coads_climatology.nc"}, {"parents": [0], "operation": {"type": "get", "id": "VWND"}, "type": "variable"}, {"parents": [1], "operation": {"grid": null, "squeeze": 0, "type": "subset", "axes": {"COADSX": [60.0, 180.0], "COADSY": [0, 90], "TIME": ["0-1-16 6:0:0.0", "0-12-16 1:20:6.0"]}, "order": null}, "type": "variable"}]}
  }

  // create the session
  sessionPromise = vcs.createSession(url);

  sessionPromise.catch(() => {
    console.log('Could not connect to ' + url);
  });

  var canvasPromise = sessionPromise.then(function (session) {
    return session.init(document.getElementById('vcs-isofill'));
  });

  // generate the plot when all of the promises resolve
  canvasPromise.then(function (canvas) {
    var dataSpec = variables.SST;
    canvas.plot(dataSpec, 'no_legend', 'isofill', 'robinson', 'server');
  });

  var canvasPromise3 = sessionPromise.then(function (session) {
    return session.init(document.getElementById('vcs-vector'));
  });
    // generate the plot when all of the promises resolve
  canvasPromise3.then(function (canvas) {
    var dataSpec = [variables.UWND, variables.VWND];
    canvas.plot(dataSpec, 'default', 'vector', 'default', 'server');
  });

  var canvasPromise4 = sessionPromise.then(function (session) {
    return session.init(document.getElementById('vcs-vector-subset'));
  });

  // generate the plot when all of the promises resolve
  canvasPromise4.then(function (canvas) {
    var dataSpec = [variables.UWND_sub, variables.VWND_sub];
    canvas.plot(dataSpec, 'default', 'vector', 'default', 'server');
  });

  $(window).on('beforeunload', function() {
    canvasPromise.then((canvas) => canvas.close());
    canvasPromise3.then((canvas) => canvas.close());
    canvasPromise4.then((canvas) => canvas.close());        
    return 'Your own message goes here...';
  });
});

