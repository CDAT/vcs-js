var canvas;
var renderer;
var boxfill;
var variables;


function printcolormapnames()
{
  var namesPromise = vcs.getcolormapnames();
  namesPromise.then((names) => {
    console.log(names);
  });
}

function printcolormap(name)
{
  var colorsPromise = vcs.getcolormap(name);
  colorsPromise.then((colors) => {
    console.log(colors);
  });
}

function removecolormap(name)
{
  var colorsPromise = vcs.removecolormap(name);
  colorsPromise.then((retVal) => {
    console.log(retVal);
  });
}

function printgraphicsmethodtypes(typeName)
{
  var namesPromise = vcs.getgraphicsmethodtypes(typeName);
  namesPromise.then((names) => {
    console.log(names);
  });
}

function printgraphicsmethodnames(typeName)
{
  var namesPromise = vcs.getgraphicsmethodnames(typeName);
  namesPromise.then((names) => {
    console.log(names);
  });
}

function printgraphicsmethod(type, name)
{
  var colorsPromise = vcs.getgraphicsmethod(type, name);
  colorsPromise.then((gm) => {
    console.log(gm);
  });
}

function removegraphicsmethod(typeName, name)
{
  var colorsPromise = vcs.removegraphicsmethod(typeName, name);
  colorsPromise.then((retVal) => {
    console.log(retVal);
  });
}

function printvariablecounts() {
  vcs.getgraphicsmethodvariablecount('vector').then((vectorCount) => {
    console.log(`Expected 2, got ${vectorCount}.  ${vectorCount === 2 ? 'SUCCESS!' : 'FAILURE'}`);
    vcs.getgraphicsmethodvariablecount('boxfill').then((boxFillCount) => {
      console.log(`Expected 1, got ${boxFillCount}.  ${boxFillCount === 1 ? 'SUCCESS!' : 'FAILURE'}`);
      vcs.getgraphicsmethodvariablecount('streamline').then((streamLineCount) => {
        console.log(`Expected 2, got ${streamLineCount}.  ${streamLineCount === 2 ? 'SUCCESS!' : 'FAILURE'}`);
      });
    });
  });
}



function vcs_boxfill_close()
{
  canvas.close();
}

function vcs_boxfill_clear()
{
  canvas.clear();
}


function vcs_plot_mycolormap(evt) {
  function applyMagmaColorsToMyMap(colorMapNotUsed) {
    vcs.getcolormap('magma').then((magmaCm) => {
      vcs.setcolormap('mycolormap', magmaCm).then(() => {
        boxfill.colormap = 'mycolormap';
        var rendererPromise = canvas.plot(variables.clt, boxfill);
        rendererPromise.then((r) => {
          renderer = r;
          renderer.onImageReady(() => {
            console.log('Ready magma');
          });
        });
      });
    });
  }

  vcs.getcolormap('mycolormap').then(applyMagmaColorsToMyMap, (cmErr) => {
    // Didn't have "mycolormap" yet, so we'll create it
    vcs.createcolormap('mycolormap').then(applyMagmaColorsToMyMap);
  });
}


function vcs_boxfill_resize()
{
  canvas.resize(600, 400);
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
                logString = v + shape + ' [' + vars[v].name + ', ' +
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
  variables = {
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

  canvas = vcs.init(document.getElementById('vcs-boxfill'));
  vcs.creategraphicsmethod('boxfill', 'myboxfill').then((gm) => {
    boxfill = gm;
    return canvas.plot(variables.clt, ['boxfill', 'myboxfill']);
  }).then((r) => {
    renderer = r;
    renderer.onImageReady(() => {
      console.log("Ready1");
    });

    // // what if we want to plot over the first plot
    // // This seems to work just fine when uncommented, except for some
    // // slight misalignment of the vector layer
    // var dataSpec = [variables.u, variables.v];
    // var rendererPromise2 = canvas.plot(dataSpec, ['vector', 'default']);
    // rendererPromise2.then((r) => {
    //   r.onImageReady(() => {
    //     console.log("Ready2");
    //   });
    // });
  });
  // call canvas.plot quickly, before the canvasId arrives back from the client.
  // this is ignored.
  // canvas.plot(dataSpec, boxfill);

  // var canvas2 = vcs.init(document.getElementById('plotly-isofill'));
  // canvas2.plot(dataSpec, ['isofill', 'default'], 'default', 'client');

  var canvas3 = vcs.init(document.getElementById('vcs-vector'));
  canvas3.plot([variables.u, variables.v], ['vector', 'default']);

  var canvas4 = vcs.init(document.getElementById('vcs-vector-subset'));
  vcs.creategraphicsmethod('vector', 'vector_subview', 'default').then((gm) => {
    vector_subview = gm;
    vector_subview["datawc_x1"]=60;
    vector_subview["datawc_x2"]=180;
    vector_subview["datawc_y2"]=90;
    vector_subview["datawc_y1"]=0;
    return vcs.setgraphicsmethod('vector', 'vector_subview', vector_subview);
  }).then(()=> {
    return canvas4.plot([variables.u, variables.v], ['vector', 'vector_subview']);
  });


  var canvas5 = vcs.init(document.getElementById('vcs3d'));
  canvas5.plot(variables.airt, ['3d_scalar', 'default']);

  var canvas6 = vcs.init(document.getElementById('vcs-vector-subset-cdms'));
  canvas6.plot([variables.u_subset, variables.v_subset], ['vector', 'default']);

  // unstructured grid
  var canvas7 = vcs.init(document.getElementById('vcs-meshfill3'));
  canvas7.plot(variables.sample3, ['meshfill', 'default']);

  var canvas8 = vcs.init(document.getElementById('vcs-meshfill3-subset'));
  canvas8.plot(variables.sample3_subset, ['meshfill', 'default']);

  // curvilinear grid
  var canvas9 = vcs.init(document.getElementById('vcs-meshfill4'));
  canvas9.plot(variables.sample4, ['meshfill', 'default']);

  var canvas10 = vcs.init(document.getElementById('vcs-meshfill4-subset'));
  canvas10.plot(variables.sample4_subset, ['meshfill', 'default']);
});
