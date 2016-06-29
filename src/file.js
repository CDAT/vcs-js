import Promise from './promise';

export default (session, fileName) => {
  // file prototype
  const file = {
    session,
    fileName,
    variables() {
      return Promise.delay(0, []);
    },
    createData(variable, subset) {
      return Promise.delay(0, {});
    },
    set(data) { // ?
      return Promise.delay(0, true);
    },
  };

  return Promise.delay(0, file);
};
