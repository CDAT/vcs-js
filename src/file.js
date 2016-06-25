import Promise from './promise';

export default (session, fileName) => {
  // file prototype
  const file = {
    session,
    fileName,
    variables: function variables() {
      return Promise.delay(0, []);
    },
    createData: function createData(variable, subset) {
      return Promise.delay(0, {});
    },
    set: function set(data) { // ?
      return Promise.delay(0, true);
    },
  };

  return Promise.delay(0, file);
};
