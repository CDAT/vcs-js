/* global vcs document */
/* eslint-disable no-unused-vars */

let canvas;
let renderer;
let boxfill;
let variables;
let pdfBlobUrl;
let pngBlobUrl;


// const { vcs } = window;

function printcolormapnames() {
  const namesPromise = vcs.getcolormapnames();
  namesPromise.then((names) => {
    console.log(names);
  });
}

function printcolormap(name) {
  const colorsPromise = vcs.getcolormap(name);
  colorsPromise.then((colors) => {
    console.log(colors);
  });
}

function removecolormap(name) {
  const colorsPromise = vcs.removecolormap(name);
  colorsPromise.then((retVal) => {
    console.log(retVal);
  });
}

function printgraphicsmethodtypes(typeName) {
  const namesPromise = vcs.getgraphicsmethodtypes(typeName);
  namesPromise.then((names) => {
    console.log(names);
  });
}

function printgraphicsmethodnames(typeName) {
  const namesPromise = vcs.getgraphicsmethodnames(typeName);
  namesPromise.then((names) => {
    console.log(names);
  });
}

function printgraphicsmethod(type, name) {
  const colorsPromise = vcs.getgraphicsmethod(type, name);
  colorsPromise.then((gm) => {
    console.log(gm);
  });
}

function removegraphicsmethod(typeName, name) {
  const colorsPromise = vcs.removegraphicsmethod(typeName, name);
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

function vcsBoxfillClose() {
  canvas.close();
}

function vcsBoxfillClear() {
  canvas.clear();
}


function vcsPlotMycolormap(evt) {
  function applyMagmaColorsToMyMap(colorMapNotUsed) {
    vcs.getcolormap('magma').then((magmaCm) => {
      vcs.setcolormap('mycolormap', magmaCm).then(() => {
        boxfill.colormap = 'mycolormap';
        const rendererPromise = canvas.plot(variables.clt, boxfill);
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
    // Didn't have 'mycolormap' yet, so we'll create it
    vcs.createcolormap('mycolormap').then(applyMagmaColorsToMyMap);
  });
}

function vcsBoxfillResize() {
  canvas.resize(600, 400);
  console.log('div resize');
}

function captureCanvasScreenshot() {
  canvas.screenshot('pdf', true, false, null).then((result) => {
    console.log('Got screenshot result:');
    console.log(result);
    const { blob, type } = result;
    pdfBlobUrl = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = pdfBlobUrl;
    const fname = `image.${type}`;
    link.download = fname;
    link.innerHTML = `Click here to download ${fname}`;
    document.body.appendChild(link);
  });

  canvas.screenshot('png', true, false, null, 1024, 768).then((result) => {
    console.log('Got screenshot result:');
    console.log(result);
    const { blob, type } = result;
    pngBlobUrl = URL.createObjectURL(blob);

    var img = document.createElement("img");
    img.classList.add("obj");
    img.file = blob;
    img.width = 200;
    img.height = 176;

    var link = document.createElement("a");
    link.href = pngBlobUrl;
    const fname = `image.${type}`;
    link.download = fname;
    link.appendChild(img);
    document.body.appendChild(link);

    var reader = new FileReader();
    reader.onload = function(e) {
      img.src = e.target.result;
    };
    reader.readAsDataURL(blob);
  });
}

function cleanup() {
  /*
  According the to the documentation here:

    https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL

  the objectURLs will be revoked when the document is unloaded, so this
  isn't technically needed in the case of this demo.  However it is
  included as a reminder of the proper approach which should be taken
  if necessary/possible on a case by case basis.
  */
  console.log('Cleaning up object URLs');
  URL.revokeObjectURL(pdfBlobUrl);
  URL.revokeObjectURL(pngBlobUrl);
}

/**
 * Prints the result from get_variables to the console.
 * @param {string? filename An absolute path to a netcdf file
 */
function printVariables(filename) {
  vcs.variables(filename).then(
    (varsAxes) => {
      // variables
      const [vars, axes] = varsAxes;
      Object.keys(vars).forEach((v) => {
        // shape of the variable
        let shape = `(${vars[v].shape[0]}`;
        for (let i = 1; i < vars[v].shape.length; i += 1) {
          shape += `,${vars[v].shape[i]}`;
        }
        shape += ')';
        // axes for the variable
        const al = vars[v].axisList;
        let axisList = `(${al[0]}`;
        for (let i = 1; i < al.length; i += 1) {
          axisList += `, ${al[i]}`;
        }
        axisList += ')';
        // bounds are received for longitude and latitude
        let boundsString = '';
        if (vars[v].bounds) {
          boundsString += `: (${vars[v].bounds[0]}, ${vars[v].bounds[1]})`;
        }
        // longitude, latitude for the variable
        // these are different than the axes for the curvilinear or
        // generic grids
        let lonLat = null;
        if (vars[v].lonLat) {
          lonLat = `(${vars[v].lonLat[0]}, ${vars[v].lonLat[1]})`;
        }
        let logString = `${v}${shape} [${vars[v].name}, ${vars[v].units}${boundsString}]: ${axisList}`;
        if (lonLat) {
          logString += `, ${lonLat}`;
        }
        if (vars[v].gridType) {
          logString += `, ${vars[v].gridType}`;
        }
        console.log(logString);
      });
      // all axes in the file
      Object.keys(axes).forEach((v) => {
        let shape = `(${axes[v].shape[0]}`;
        for (let i = 1; i < axes[v].shape.length; i += 1) {
          shape += `,${axes[v].shape[i]}`;
        }
        shape += ')';
        const last = axes[v].data[axes[v].data.length - 1];
        const msg = `${v}${shape}[${axes[v].name}, ${axes[v].units}: (${axes[v].data[0]}, ${last})]`;
        console.log(msg);
      });
    },
    (reason) => {
      console.log(reason);
    },
  );
}

function startDemo() {
  const operations = [
    {
      subRegion: {
        longitude1: [70, 180],
        latitude1: [0, 90],
      },
    }, {
      subSlice: {
        longitude1: [null, null, 2],
        latitude1: [null, null, 2],
      },
    },
  ];
  const axisOrder = [0, 1, 3, 2];
  variables = {
    // unstructured grid
    sample3: {
      uri: 'sampleGenGrid3.nc',
      variable: 'sample',
    },
    sample3_subset: {
      uri: 'sampleGenGrid3.nc',
      variable: 'sample',
      operations: [
        {
          subRegion: {
            lon: [90, 150],
            lat: [-60, 60],
          },
        },
      ],
    },

    // curvilinear grid
    sample4: {
      uri: 'sampleCurveGrid4.nc',
      variable: 'sample',
    },
    sample4_subset: {
      uri: 'sampleCurveGrid4.nc',
      variable: 'sample',
      operations: [
        {
          subRegion: {
            lon: [60, 359.6620551632433],
            lat: [-20, 88.64672617835618],
          },
        },
      ],
    },

    clt: {
      uri: 'clt.nc',
      variable: 'clt',
    },
    u: {
      uri: 'clt.nc',
      variable: 'u',
    },
    v: {
      uri: 'clt.nc',
      variable: 'v',
    },

    // execute a list of operations on the variable
    // for subSlice, null (or undefined) means the current value for being or end index
    u_subset: {
      uri: 'clt.nc',
      variable: 'u',
      operations: operations,
      axis_order: axisOrder,
    },
    v_subset: {
      uri: 'clt.nc',
      variable: 'v',
      operations: operations,
      axis_order: axisOrder,
    },

    airt: {
      uri: 'coads_climatology.nc',
      variable: 'AIRT',
    },
  };

  canvas = vcs.init(document.getElementById('vcs-boxfill'));
  vcs.creategraphicsmethod('boxfill', 'myboxfill').then((gm) => {
    boxfill = gm;
    return canvas.plot(variables.clt, ['boxfill', 'myboxfill']);
  }).then((r) => {
    renderer = r;
    renderer.onImageReady(() => {
      console.log('Ready1');
    });

    // // what if we want to plot over the first plot
    // // This seems to work just fine when uncommented, except for some
    // // slight misalignment of the vector layer
    // var dataSpec = [variables.u, variables.v];
    // var rendererPromise2 = canvas.plot(dataSpec, ['vector', 'default']);
    // rendererPromise2.then((r) => {
    //   r.onImageReady(() => {
    //     console.log('Ready2');
    //   });
    // });
  });
  // call canvas.plot quickly, before the canvasId arrives back from the client.
  // this is ignored.
  // canvas.plot(dataSpec, boxfill);

  // var canvas2 = vcs.init(document.getElementById('plotly-isofill'));
  // canvas2.plot(dataSpec, ['isofill', 'default'], 'default', 'client');

  const canvas3 = vcs.init(document.getElementById('vcs-vector'));
  canvas3.plot([variables.u, variables.v], ['vector', 'default']);

  const canvas4 = vcs.init(document.getElementById('vcs-vector-subset'));
  vcs.creategraphicsmethod('vector', 'vector_subview', 'default').then((gm) => {
    const vectorSubview = gm;
    vectorSubview.datawc_x1 = 60;
    vectorSubview.datawc_x2 = 180;
    vectorSubview.datawc_y2 = 90;
    vectorSubview.datawc_y1 = 0;
    return vcs.setgraphicsmethod('vector', 'vector_subview', vectorSubview);
  }).then(() => canvas4.plot([variables.u, variables.v], ['vector', 'vector_subview']));


  const canvas5 = vcs.init(document.getElementById('vcs3d'));
  canvas5.plot(variables.airt, ['3d_scalar', 'default']);

  const canvas6 = vcs.init(document.getElementById('vcs-vector-subset-cdms'));
  canvas6.plot([variables.u_subset, variables.v_subset], ['vector', 'default']);

  // unstructured grid
  const canvas7 = vcs.init(document.getElementById('vcs-meshfill3'));
  canvas7.plot(variables.sample3, ['meshfill', 'default']);

  const canvas8 = vcs.init(document.getElementById('vcs-meshfill3-subset'));
  canvas8.plot(variables.sample3_subset, ['meshfill', 'default']);

  // curvilinear grid
  const canvas9 = vcs.init(document.getElementById('vcs-meshfill4'));
  canvas9.plot(variables.sample4, ['meshfill', 'default']);

  const canvas10 = vcs.init(document.getElementById('vcs-meshfill4-subset'));
  canvas10.plot(variables.sample4_subset, ['meshfill', 'default']);
}

startDemo();
