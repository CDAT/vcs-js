import { compare } from 'resemblejs';

import config from '../../config/scripts/config.json';

/* eslint-disable import/no-webpack-loader-syntax */
const vcsInjector = require('inject-loader!vcs');

// Module-level singleton
let containerCount = 0;
let mockedVcs = null;
const testContainers = {};

export function getTestRequirements(testName, imageTest = true) {
  const testReqs = {};

  if (mockedVcs === null) {
    const { vtkwebListenHost, vtkwebListenPort } = config;
    const sessionUrl = `ws://${vtkwebListenHost}:${vtkwebListenPort}/ws`;
    mockedVcs = vcsInjector({
      './config': { sessionUrl },
    });
  }

  testReqs.vcs = mockedVcs;

  if (imageTest && !testContainers[testName]) {
    const testDiv = document.createElement('div');
    testDiv.setAttribute('class', `vcs-js-test-container-${containerCount}`);
    testDiv.setAttribute('style', 'position:relative; width: 400px; height: 350px; border: 1px solid black;');

    const divElt = document.createElement('div');
    // divElt.setAttribute('class', `vcs-js-test-container-${containerCount}`);
    divElt.setAttribute('style', 'position: absolute; bottom: 0; width: 400px; height: 300px;');

    const saveLinkElt = document.createElement('a');
    saveLinkElt.setAttribute('download', 'baseline.png');
    saveLinkElt.setAttribute('style', 'position: absolute: top: 0; color: blue; cursor: pointer;');
    saveLinkElt.innerText = 'Save Baseline';
    saveLinkElt.onclick = () => {
      const canvas = divElt.querySelector('canvas');
      const dataURL = canvas.toDataURL('image/png');
      saveLinkElt.href = dataURL;
    };

    const bodyElt = document.querySelector('body');
    testDiv.appendChild(divElt);
    testDiv.appendChild(saveLinkElt);
    bodyElt.appendChild(testDiv);

    containerCount += 1;
    testContainers[testName] = {
      testDiv,
      divElt,
      saveLinkElt,
    };

    testReqs.container = testContainers[testName].divElt;
  }

  return testReqs;
}

export function comparePlotToBaseline(plot, canvas, baselines, testName, threshold = 0.5) {
  let minDelta = 100;
  let isSameDimensions = false;

  const comparePromise = new Promise((resolve, reject) => {
    plot.then((remoteRenderer) => {
      remoteRenderer.onImageLoaded(() => {
        const testImage = canvas.el.querySelector('canvas').toDataURL('image/png');
        const baselineList = baselines[testName];

        if (baselineList && baselineList.length > 0) {
          const nbBaselines = baselineList.length;
          baselineList.forEach((baseline, idx) => {
            compare(baseline, testImage, { transparency: 0.5 }, (err, data) => {
              if (err) {
                console.error('Image comparison system failure: ', err);
                reject(new Error('Image comparison system failure'));
              } else {
                if (minDelta >= data.misMatchPercentage) {
                  minDelta = data.misMatchPercentage;
                }
                isSameDimensions = isSameDimensions || data.isSameDimensions;

                if (idx + 1 === nbBaselines) {
                  if (minDelta >= threshold) {
                    const msg = `${testName} - Image mismatch: best diff (${minDelta}) > threshold (${threshold})`;
                    reject(new Error(msg));
                  }

                  if (!isSameDimensions) {
                    reject(new Error(`${testName} - Image match resolution`));
                  }

                  resolve(data);
                }
              }
            });
          });
        } else {
          reject(new Error(`${testName} given no baselines to compare against!`));
        }
      });
    });
  });

  return comparePromise;
}

export default {
  comparePlotToBaseline,
  getTestRequirements,
};
