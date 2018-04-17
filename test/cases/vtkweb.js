/* eslint-disable func-names */
import { comparePlotToBaseline, getTestRequirements } from '../util/TestUtils';

import baselines from '../baselines';


function getOrCreateGraphicsMethod(vcs, type, name) {
  return vcs.getgraphicsmethod(type, name).then(
    gm => gm,
    err => vcs.creategraphicsmethod(type, name).then(gm => gm),
  );
}

function getOrCreateColorMap(vcs, name) {
  return vcs.getcolormap(name).then(
    cm => cm,
    err => vcs.createcolormap(name).then(cm => cm),
  );
}


describe('endToEnd', function endToEnd() {
  this.timeout(5000);

  it('rendersABoxfillImage', function () {
    const testName = this.test.title;
    const { vcs, container } = getTestRequirements(testName);

    const canvas = vcs.init(container);
    const clt = {
      uri: 'clt.nc',
      variable: 'clt',
    };

    getOrCreateGraphicsMethod(vcs, 'boxfill', 'myboxfill').then((gm) => {
      const plot = canvas.plot(clt, ['boxfill', 'myboxfill']);
      return comparePlotToBaseline(plot, canvas, baselines, testName, 1);
    });
  });

  it('rendersALinePlotImage', function () {
    const testName = this.test.title;
    const { vcs, container } = getTestRequirements(testName);

    const canvas = vcs.init(container);
    const variables = {
      u: {
        uri: 'clt.nc',
        variable: 'u',
      },
      v: {
        uri: 'clt.nc',
        variable: 'v',
      },
    };

    const plot = canvas.plot([variables.u, variables.v], ['vector', 'default']);
    return comparePlotToBaseline(plot, canvas, baselines, testName, 10);
  });

  it('appliesMagmaColorsToMap', function () {
    const testName = this.test.title;
    const { vcs, container } = getTestRequirements(testName);

    const canvas = vcs.init(container);
    const clt = {
      uri: 'clt.nc',
      variable: 'clt',
    };

    function applyColors(gm) {
      return vcs.getcolormap('magma').then((magmaCm) => {
        return vcs.setcolormap('mycolormap', magmaCm).then(() => {
          gm.colormap = 'mycolormap';
          const plot = canvas.plot(clt, gm);
          return comparePlotToBaseline(plot, canvas, baselines, testName, 10);
        });
      });
    }

    return getOrCreateColorMap(vcs, 'mycolormap')
      .then(() => getOrCreateGraphicsMethod(vcs, 'boxfill', 'myboxfill'))
      .then(applyColors);
  });

  it('getsAllColorMapNames', function () {
    const testName = this.test.title;
    const { vcs } = getTestRequirements(testName, false);

    const expectedNames = [
      'AMIP', 'NCAR', 'bl_to_darkred', 'bl_to_drkorang', 'blends', 'blue2darkorange',
      'blue2darkred', 'blue2green', 'blue2grey', 'blue2orange', 'blue2orange2red',
      'blue_to_grey', 'blue_to_grn', 'blue_to_orange', 'blue_to_orgred', 'brown2blue',
      'brown_to_blue', 'categorical', 'classic', 'default', 'green2magenta',
      'grn_to_magenta', 'inferno', 'lightblue2darkblue', 'ltbl_to_drkbl', 'magma',
      'plasma', 'rainbow', 'rainbow_no_grn', 'rainbownogreen', 'sequential', 'viridis',
      'white2blue', 'white2green', 'white2magenta', 'white2red', 'white2yellow',
      'white_to_blue', 'white_to_green', 'white_to_magenta', 'white_to_red',
      'white_to_yellow',
    ];

    return vcs.getcolormapnames().then((colorMapNames) => {
      return new Promise((resolve, reject) => {
        const missing = [];
        expectedNames.forEach((name) => {
          if (colorMapNames.indexOf(name) < 0) {
            missing.push(name);
          }
        });
        if (missing.length > 0) {
          reject(new Error(`Missing colormap names: [${missing.join(',')}]`));
        }
        resolve(true);
      });
    });
  });

  it('getsFileInfoForOneVar', function () {
    const testName = this.test.title;
    const { vcs } = getTestRequirements(testName, false);

    return vcs.getfileinfo('clt.nc', 'clt').then((cltInfo) => {
      return new Promise((resolve, reject) => {
        const contains = '*** Description of Slab clt ***';
        if (cltInfo.indexOf(contains) < 0) {
          reject(new Error(`Expected result to start with \'${contains}\'`));
        }
        resolve(true);
      });
    });
  });

  it('getsFileInfoForAllVar', function () {
    const testName = this.test.title;
    const { vcs } = getTestRequirements(testName, false);

    return vcs.getfileinfo('clt.nc').then((cltInfo) => {
      return new Promise((resolve, reject) => {
        const expectedKeys = ['clt', 'u', 'v'];
        expectedKeys.forEach((key) => {
          if (! key in cltInfo) {
            reject(new Error(`Expected the key ${key} to appear in result`));
          } else {
            const contains = `*** Description of Slab ${key} ***`;
            if (cltInfo[key].indexOf(contains) < 0) {
              reject(new Error(`Expected result to start with \'${contains}\'`));
            }
          }
        });
        resolve(true);
      });
    });
  });
});
