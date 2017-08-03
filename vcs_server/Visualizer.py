"""This module exposes methods for finding and creating visualizations."""

import json
from autobahn.wamp import register
# import vtk modules.
import vtk
from vtk.web import protocols, server
# vcs modules
import vcs
import cdms2
import sys
import traceback
from VcsPlot import VcsPlot


class Visualizer(protocols.vtkWebProtocol):

    _canvas = {}

    @register('vcs.canvas.plot')
    def plot(self, prevCanvasId, variable, template, method, width, height, opts={}):
        try:
            canvas = self._canvas[prevCanvasId] if prevCanvasId != 0 else None
            if (prevCanvasId):
                print 'Using existing canvas % d', prevCanvasId
            plot = VcsPlot(canvas, width=width, height=height)
            plot.setGraphicsMethod(method)
            plot.setTemplate(template)
            all_vars = []
            for obj in variable:
                all_vars.append(cdms2.open(obj['uri'])(obj['variable']))
            plot.loadVariable(all_vars)
            canvas = plot.getCanvas()
            canvasId = id(canvas)
            self._canvas[canvasId] = canvas
            windowId = self.getGlobalId(plot.getWindow())
            print 'storing canvas %d' % canvasId
            return [canvasId, windowId]
        except:
            exc_type, exc_value, exc_traceback = sys.exc_info()
            lines = traceback.format_exception(exc_type, exc_value, exc_traceback)
            print ''.join('!! ' + line for line in lines)  # Log it or whatever here
            return 0

    @register('vcs.canvas.clear')
    def clear(self, id):
        if id in self._canvas:
            print 'clearing canvas %s' % id
            self._canvas[id].clear()
            return True
        print 'clearing canvas: %s not found' % id
        return False

    @register('vcs.canvas.close')
    def close(self, id):
        print 'close canvas %s' % id
        canvas = self._canvas.pop(id)
        if canvas:
            print 'calling close'
            canvas.close()
            del canvas
            return True
        print 'canvas %s not found' % id
        return False

    @classmethod
    def detect_nvars(cls, g_type, g_method, g_obj):
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
            'nvars': Visualizer.detect_nvars(t, m, vcs.elements[t][m])
        }
