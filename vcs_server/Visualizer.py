"""This module exposes methods for finding and creating visualizations."""

import json
from wslink import register as exportRpc
# import vtk modules.
import vtk
from vtk.web import protocols
# vcs modules
import vcs
import cdms2
import sys
import traceback
from VcsPlot import VcsPlot


class Visualizer(protocols.vtkWebProtocol):

    _canvas = {}

    @exportRpc('vcs.canvas.plot')
    def plot(self, prevWindowId, varSpecs, template, method, width, height, opts={}):
        try:
            canvas = self._canvas[prevWindowId] if prevWindowId != 0 else None
            plot = VcsPlot(canvas, width=width, height=height)
            plot.setGraphicsMethod(method)
            plot.setTemplate(template)
            all_vars = []
            for varSpec in varSpecs:
                f = cdms2.open(varSpec['uri'])
                # use [] so that the var is not read.
                var = f[varSpec['variable']]
                if ('operations' in varSpec):
                    for op in varSpec['operations']:
                        if ('subRegion' in op):
                            kargs = op['subRegion']
                            var = var.subRegion(**kargs)
                        elif ('subSlice' in op):
                            kargs = op['subSlice']
                            # fill in None with begin and end of the current axis
                            for axis in kargs.keys():
                                values = kargs[axis]
                                newValues = values
                                axisIndex = var.getAxisIndex(axis)
                                if values[0] is None:
                                    newValues[0] = 0
                                if values[1] is None:
                                    newValues[1] = var.shape[axisIndex] - 1
                                kargs[axis] = slice(*newValues)
                            var = var.subSlice(**kargs)
                all_vars.append(var)

            plot.loadVariable(all_vars)
            canvas = plot.getCanvas()
            windowId = self.getGlobalId(plot.getWindow())
            self._canvas[windowId] = canvas
            return [windowId]
        except:
            exc_type, exc_value, exc_traceback = sys.exc_info()
            lines = traceback.format_exception(exc_type, exc_value, exc_traceback)
            print ''.join('!! ' + line for line in lines)  # Log it or whatever here
            return 0

    @exportRpc('vcs.canvas.clear')
    def clear(self, windowId):
        if windowId in self._canvas:
            self._canvas[windowId].clear()
            return True
        return False

    @exportRpc('vcs.canvas.resize')
    def resize(self, windowId, width, height):
        if windowId in self._canvas:
            canvas = self._canvas[windowId];
            canvas.geometry(width, height)
            return True
        return False

    @exportRpc('vcs.canvas.close')
    def close(self, windowId):
        canvas = self._canvas.pop(windowId)
        if canvas:
            canvas.close()
            del canvas
            return True
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
