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

    # Colormap routines
    @exportRpc('vcs.colormapnames')
    def colormapnames(self):
        """Returns a list of colormap names"""
        return vcs.elements['colormap'].keys()

    @exportRpc('vcs.getcolormap')
    def getcolormap(self, name):
        """Returns the color values in a colormap"""
        name = str(name)
        return vcs.getcolormap(name).getindex().values()

    @exportRpc('vcs.setcolormap')
    def setcolormap(self, name, values):
        """Sets color values in a specified colormap"""
        name = str(name)
        cm = vcs.getcolormap(name)
        for i, value in enumerate(values):
            cm.setcolorcell(i, value[0], value[1], value[2], value[3])

    @exportRpc('vcs.createcolormap')
    def createcolormap(self, name, nameSource):
        """Creates a colormap 'name' as a copy of 'nameSource'"""
        name = str(name)
        if (nameSource is None):
            nameSource = 'default'
        nameSource = str(nameSource)
        cm = vcs.createcolormap(name, nameSource)
