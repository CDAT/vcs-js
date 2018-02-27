
/* eslint-disable camelcase */
import appliesMagmaColorsToMap from './appliesMagmaColorsToMap.png';
import rendersABoxfillImage from './rendersABoxfillImage.png';
import rendersALinePlotImage from './rendersALinePlotImage.png';
import rendersALinePlotImage_01 from './rendersALinePlotImage_01.png';

const baselineImages = {
  appliesMagmaColorsToMap,
  rendersABoxfillImage,
  rendersALinePlotImage,
  rendersALinePlotImage_01,
};

const baselines = {};
const baselineRegex = /([^/_.]+)(_[\d]+)?$/;

Object.keys(baselineImages).forEach((imageName) => {
  const m = baselineRegex.exec(imageName);
  if (m) {
    const baselineName = m[1];
    if (!(baselineName in baselines)) {
      baselines[baselineName] = [];
    }
    baselines[baselineName].push(baselineImages[baselineName]);
  } else {
    console.log(`Warning, baseline path not acceptable: ${imageName}`);
    console.log('Baseline will be ignored');
  }
});

export default baselines;
