vcs.js [![Build Status](https://travis-ci.org/UV-CDAT/vcs-js.svg?branch=master)](https://travis-ci.org/UV-CDAT/vcs-js) [![codecov](https://codecov.io/gh/UV-CDAT/vcs-js/branch/master/graph/badge.svg)](https://codecov.io/gh/UV-CDAT/vcs-js)
======

For documentation see the [interface document](https://docs.google.com/a/kitware.com/document/d/1pY-C4o3JRejKyTja-ScLdx4U9pHFxcWzeptT32KOVgY/edit?usp=sharing).

To get started, first run `npm install`.

Useful npm commands:
```bash
npm run build                 # build the library to dist/vcs.js
npm run build-continuous      # build the library to dist/vcs.js and rebuild after changes
npm run test                  # run all tests against an actual server
npm run test:serve            # start test service (runs as files change)
npm run demo                  # serve the demo page at http://localhost:8080/demo/
```

Running the vcs.js demo
-----------------------

Executing the demo requires a running vtkweb service, which is assumed to exist at <ws://localhost:9000/ws>.
A basic protocol implementation for demo purposes exists in this repository at `scripts/vcs_server`.
You can start the server with the command `PYTHONPATH=. vtkpython scripts/vcs-server -p 9000`.  Use the `--help` argument
for a list of options.  After starting the server, you can execute the demo using `npm run demo` and
browsing to <http://localhost:8080/demo>.

If you get an error message refering to `WAMP_FEATURES` while building, try running the following:
```
npm run fix-autobahn
```

Running the vtkweb demo with vcs
--------------------------------

To start the server run `vtkpython demo1/vcs_server.py -p 1234`.
For runnig the client, use the same procedure as for vcs.js demo (`npm run demo`). If the client for
vcs.js demo is already started, just browse to <http://localhost:8080/demo1>.


Running the vtkweb demo with VTK
--------------------------------
To start the server run `vtkpython demo1/vtk_web_cone.py -p 1234`
To run the client use the same procedure as for vtkweb demo with vcs.


Running the vtkweb demo with ParaView
-------------------------------------
This is used to look at differences between vtkweb with ParaView server and with VTK server.
To start the server run `PV_ALLOW_BATCH_INTERACTION=1 ~/projects/ParaView/build/bin/pvbatch pv_server.py -p 1234`
To run the client use the same procedure as for vtkweb demo with vcs.

Running the tests
=================

In summary, tests are end-to-end and can be run in single shot or continuous
mode, as long as we know where to find your uv-cdat conda environment.  So either
activate the environment (e.g. `source activate 2.12`) or just set the following
environment variable:

```
export CONDA_PREFIX=/home/projects/miniconda3/envs/2.12
```

Then to run all the tests once you can run:

```
npm run test
```

Or to run in continuous mode for debugging you can run:

```
npm run test:serve
```

Some of the details
-------------------

The testing framework uses `karma`, `mocha`, and `chai`, and provides an
end-to-end testing solution to exercise the full path to the VCS backend,
even comparing images delivered back to the client against known baselines.
This approach has the benefite of exercising the `vcs-js` python code (rpc
methods) as well as the client-side Javascript libraries.

For this to work, we must run a version of the python server with VCS modules
available to import.  Currently several `npm` commands are available to automate
this entire process.  All the tests can be run in a single shot, or can be run
in continuous mode for debugging, using one of two `npm` scripts.  The server
and karma tests can also be started separately for more flexibility.

Debugging the tests
-------------------

To do it all in a single command, you must first either activate the uv-cdat
conda environment or just set the `CONDA_PREFIX` environment variable as
described above.  Then just run:

```
npm run test:serve
```

This will start a test python server and also start `karma` in watch
mode, which brings up a Chrome browser.  You can debug your tests by clicking
the `Debug` button in the browser.

Currently coverage can be viewed in the terminal live, or by pointing your
browser at the file system:

```
file:///home/projects/uvcdat/vcs-js/dist/coverage
```

and then navigating to the Chrome version folder.

Adding new tests/baselines
--------------------------

To add new tests, follow the existing examples in the project, which can
be found at `test/cases/vtkweb.js`.  Using the continuous karma testing
approach, click on the `Debug` button to debug your new test.  If it's an
image comparison test, it should fail initially as there will be no baseline
for it, but the karma debug tab will provide a link to save one.

Once you click the "Save baseline" link, copy it to the baselines folder,
located at `test/baselines/`.  Name it the same as the test, following the
other examples there.  If it is a new baseline for an existing test (i.e.
one of multiple baselines), use the `<testname>_01.png` approach to name it.

Once you have copied the image, edit the `test/baselines/index.js` to include
the new baseline.  First you must import the baseline image, then add it to
the `baselineImages` dictionary, following the other examples there.

At this point, the test should pass, assuming you did all of the above.
