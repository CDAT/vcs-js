import axios from 'axios';
import ndarray from 'ndarray';

function parseMetadata(headers) {
  return Object.keys(headers).reduce((obj, key) => {
    const lowerKey = key.toLowerCase();
    if (!lowerKey.startsWith('x-cdms-')) {
      return obj;
    }

    let val = headers[key];
    const shortKey = lowerKey.replace('x-cdms-', '');
    if (shortKey.startsWith('axis-')) {
      obj.axes[shortKey.replace('axis-', '')] = JSON.parse(headers[key]);
      return obj;
    }

    if (val.indexOf('|') !== -1) {
      val = val.split('|');
    }

    if (shortKey === 'shape' && !Array.isArray(val)) {
      val = [val];
    }

    if (shortKey === 'shape') {
      val = val.map((v) => { return parseInt(v, 10); });
    }

    obj[shortKey] = val;
    return obj;
  }, { axes: {} });
}

function readArray(data, meta) {
  // const dtype = meta.dtype;
  // const shape = meta.shape;
  const { dtype, shape } = meta;
  let arr = null;
  switch (dtype) {
    case 'int8':
      arr = new Int8Array(data);
      break;
    case 'uint8':
      arr = new Uint8Array(data);
      break;
    case 'int16':
      arr = new Int16Array(data);
      break;
    case 'uint16':
      arr = new Uint16Array(data);
      break;
    case 'int32':
      arr = new Int32Array(data);
      break;
    case 'uint32':
      arr = new Uint32Array(data);
      break;
    case 'float32':
      arr = new Float32Array(data);
      break;
    case 'float64':
      arr = new Float64Array(data);
      break;
    default:
      arr = new Float32Array(data);
  }
  return { meta, array: ndarray(arr, shape) };
}

function fetchArray(client, json) {
  return client.connection.get(`/data?var_spec=${json}`)
    .then((response) => {
      return readArray(response.data, parseMetadata(response.headers));
    });
}

function Variable(client, dataObject) {
  this.do = dataObject;
  const json = JSON.stringify(dataObject);
  this.variable = fetchArray(client, json);
  this.axes = this.variable.then((variable) => {
    return Promise.all(variable.meta.order.map((axisId) => {
      const axisSpec = variable.meta.axes[axisId];
      const axisJSON = JSON.stringify(axisSpec);
      return fetchArray(client, axisJSON);
    }));
  });
  this.ready = Promise.all([this.variable, this.axes]);

  this.getAxisIndexByType = (type, variable, axes) => {
    const axisIDs = variable.meta.order;
    const axisIndex = axisIDs.reduce((prev, cur, index) => {
      if (prev !== -1) {
        return prev;
      }
      if (variable.meta.axes[cur].axis === type) {
        return index;
      }
      return -1;
    }, -1);
    if (axisIndex === -1) {
      return false;
    }
    return axisIndex;
  };

  this.getLongitude = () => {
    return this.ready.then((variable, axes) => {
      return axes[this.getAxisIndexByType('longitude', variable, axes)];
    });
  };
  this.getLatitude = () => {
    return this.ready.then((variable, axes) => {
      return axes[this.getAxisIndexByType('latitude', variable, axes)];
    });
  };
  this.getTime = () => {
    return this.ready.then((variable, axes) => {
      return axes[this.getAxisIndexByType('time', variable, axes)];
    });
  };
  this.getLevel = () => {
    return this.ready.then((variable, axes) => {
      return axes[this.getAxisIndexByType('level', variable, axes)];
    });
  };
}


function connect(url) {
  const cdms = axios.create({ responseType: 'arraybuffer', baseURL: url });
  const client = {
    connection: cdms,
    getVariable: (dataObject) => {
      return new Variable(client, dataObject);
    },
  };
  return client;
}

const obj = {
  connect,
};

export { obj as default };
