vcs.js [![Build Status](https://travis-ci.org/UV-CDAT/vcs-js.svg?branch=master)](https://travis-ci.org/UV-CDAT/vcs-js) [![codecov](https://codecov.io/gh/UV-CDAT/vcs-js/branch/master/graph/badge.svg)](https://codecov.io/gh/UV-CDAT/vcs-js)
======

For documentation see the [interface document](https://docs.google.com/a/kitware.com/document/d/1pY-C4o3JRejKyTja-ScLdx4U9pHFxcWzeptT32KOVgY/edit?usp=sharing).

To get started, first run `npm install`.

Useful npm commands:
```bash
npm run build      # build the library to dist/vcs.js
npm run test       # run all tests
npm run test:serve # start test service (runs as files change)
npm run demo       # serve the demo page at http://localhost:8080/demo/
```

While serving tests, you can debug them in the browser at [http://localhost:9876/debug.html](http://localhost:9876/debug.html).
This will also serve the coverage results at [http://localhost:9876/coverage/index.html](http://localhost:9876/coverage/index.html).



Running the vcs.js demo
-----------------------

Executing the demo requires a running vtkweb service, which is assumed to exist at <ws://localhost:9000/ws>.
A basic protocol implementation for demo purposes exists in this repository at `server/server.py`.
You can start the server with the command `vtkpython server/server.py -p 9000`.  Use the `--help` argument
for a list of options.  After starting the server, you can execute the demo using `npm run demo` and
browsing to <http://localhost:8080/demo>.

If you get an error message refering to `WAMP_FEATURES` while building, try running the following:
```
npm run fix-autobahn
```

Running the vtkweb demo
-----------------------

To start the server run `vtkpython demo1/vtk_server.py -p 1234`.
For runnig the client, use the same procedure as for vcs.js demo (`npm run demo`). If the client for
vcs.js demo is already started, just browse to <http://localhost:8080/demo1>.
