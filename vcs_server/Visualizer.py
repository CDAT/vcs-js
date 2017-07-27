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

    _active = {}

    @register('cdat.view.create')
    def create(self, variable, template, method, opts={}):
        try:
            vis = VcsPlot()
            vis.setGraphicsMethod(method)
            vis.setTemplate(template)
            all_vars = []
            for obj in variable:
                all_vars.append(cdms2.open(obj['uri'])(obj['variable']))
            vis.loadVariable(all_vars)
            window = vis.getWindow()
            self.setActiveView(window)
            id = self.getGlobalId(window)
            self._active[id] = vis
            return id
        except:
            exc_type, exc_value, exc_traceback = sys.exc_info()
            lines = traceback.format_exception(exc_type, exc_value, exc_traceback)
            print ''.join('!! ' + line for line in lines)  # Log it or whatever here
            return 0

    @register('cdat.view.update')
    def render_view(self, id, opts={}):
        if id in self._active:
            return self._active[id].render(opts)
        return False

    @register('cdat.view.clear')
    def clear(self, id):
        if id in self._active:
            print 'clearing window %s' % id
            self._active[id].getCanvas().clear()
            self.getApplication().InvalidateCache(self.getView(id))
            self.getApplication().InvokeEvent('PushRender')
            return True
        print 'clearing window: %s not found' % id
        return False

    @register('cdat.view.close')
    def remove_view(self, id):
        print 'close window %s' % id
        vis = self._active.pop(id)
        if vis:
            print 'calling close'
            vis.getCanvas().close()
            del vis
            return True
        print 'window %s not found' % id        
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
