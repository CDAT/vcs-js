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
                if ('axis_order' in varSpec):
                    indexOrder = varSpec['axis_order']
                    stringOrder = var.getOrder()
                    stringOrder = ''.join([stringOrder[i] for i in indexOrder])
                    var = var(order=stringOrder)
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
