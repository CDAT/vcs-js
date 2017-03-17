"""This module exposes methods for finding and creating visualizations."""

import json
# import vtk modules.
import vtk
from vtk.util import numpy_support as vtk_numpy
# vcs modules
import datetime
import vcs
import cdms2
from VcsPlot import VcsPlot
import tornado
import numpy
import tornado.websocket


class Visualizer(tornado.websocket.WebSocketHandler):

    def open(self):
        self.canvas = vcs.init()
        self.canvas.open()
        self.renWin = self.canvas.backend.renWin
        self.interactor = self.canvas.backend.renWin.GetInteractor()

    def check_origin(self, origin):
        return True

    def write_canvas(self):
        w, h = self.renWin.GetSize()
        pixels = vtk.vtkUnsignedCharArray()
        self.renWin.GetRGBACharPixelData(0, 0, w - 1, h - 1, 1, pixels)
        arr = vtk_numpy.vtk_to_numpy(pixels)
        arr = arr.reshape((h, w, pixels.GetNumberOfComponents()))
        self.write_message(numpy.flipud(arr).tobytes(), binary=True)

    def plot(self, variable, template, method, opts={}):
        vis = VcsPlot(self.canvas)
        vis.setGraphicsMethod(method)
        vis.setTemplate(template)
        all_vars = []
        for obj in variable:
            all_vars.append(cdms2.open(obj["uri"])(obj["variable"]))
        vis.loadVariable(all_vars)

    def mouseDown(self, x, y):
        self.interactor.SetEventPosition(x, y, 0)
        self.interactor.LeftButtonPressEvent()

    def mouseUp(self, x, y):
        self.interactor.SetEventPosition(x, y, 0)
        self.interactor.LeftButtonReleaseEvent()

    def mouseMove(self, x, y):
        self.interactor.SetEventPosition(x, y, 0)
        self.interactor.MouseMoveEvent()

    def resize(self, width, height):
        self.canvas.geometry(width, height)

    def on_message(self, message):
        msg = json.loads(message)
        if msg["event"] == "resize":
            self.resize(msg["width"], msg["height"])
        elif msg["event"] == "plot":
            msg_keys = set(msg.keys())
            variables = msg["data"]
            gm = msg.get("gm", None)
            template = msg.get("tmpl", None)
            options = {}
            for k in msg_keys - set(("data", "gm", "tmpl")):
                options[k] = msg[k]
            self.plot(variables, template, gm, opts=options)
        elif msg["event"].startswith("mouse"):
            x, y = msg["x"], msg["y"]
            if msg["event"] == "mouseDown":
                self.mouseDown(x, y)
            elif msg["event"] == "mouseUp":
                self.mouseUp(x, y)
            elif msg["event"] == "mouseMove":
                self.mouseMove(x, y)
        elif msg["event"] == "clear":
            self.canvas.clear()

        self.write_canvas()

    def on_close(self):
        self.canvas.close()


def detect_nvars(g_type, g_method, g_obj):
    """Try to return the number of variables required for the plot method.

    Returns the number of variables required by the plot type.
    This isn't really exposed by vcs, so this is written by following this
    insanity:
    https://github.com/UV-CDAT/uvcdat/blob/master/Packages/vcs/Lib/Canvas.py#L251

    The reality is that this api will need to be more complicated in the
    future to account some methods (like meshfill) that can take one or two
    variables depending on the grid.
    """
    g_type = g_type.lower()

    # first check for g_naslabs
    if hasattr(g_obj, 'g_nslabs'):
        return g_obj.g_nslabs

    # then check methods that require 2 variables
    if g_type in _2d_methods:
        return 2

    # meshfill takes one or two, but there are extra requirements that we will
    # have to pass through the api once they are understood
    if g_type == 'meshfill':
        return 1

    # low level primitives should probably not happen
    if g_type in _primitives:
        return 0

    # 1d takes 2 variables
    if g_type == '1d':
        return 2

    # otherwise assume 1
    return 1


# initialize the list of templates and graphics methods
_ = vcs.init()
_templates = sorted(vcs.elements['template'].keys())
_methods = {}
_2d_methods = (
    'scatter', 'vector', 'xvsy', 'stream', 'glyph', '3d_vector', '3d_dual_scalar'
)
_primitives = (
    'line', 'marker', 'fillarea', 'text'
)
for t in vcs.graphicsmethodlist():
    _methods[t] = {}
    for m in vcs.elements[t].keys():
        _methods[t][m] = {
            'nvars': detect_nvars(t, m, vcs.elements[t][m])
        }
