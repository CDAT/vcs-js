"""This module exposes methods for finding and creating visualizations."""

from wslink import register as exportRpc
# import vtk modules.
import vtk
from vtk.web import protocols
# vcs modules
import vcs
import cdms2
import genutil
import cdutil
import numpy
import compute_graph
import cdat_compute_graph
from VcsPlot import VcsPlot, updateGraphicsMethodProps


class Visualizer(protocols.vtkWebProtocol):

    _canvas = {}

    @exportRpc('vcs.canvas.plot')
    def plot(self, prevWindowId, varSpecs, method, template, width, height, opts={}):
        canvas = self._canvas[prevWindowId] if prevWindowId != 0 else None
        plot = VcsPlot(canvas, width=width, height=height)
        plot.setGraphicsMethod(method)
        plot.setTemplate(template)
        all_vars = []
        for varSpec in varSpecs:
            if 'json' in varSpec:
                var = compute_graph.loadjson(varSpec['json']).derive()
            else: 
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
                    elif ('transform' in op):
                        for axis in op["transform"]:
                            method = op["transform"][axis]
                            if method == "avg":
                                var = cdutil.averager(var,axis="({})".format(axis))
                            elif method == "std":
                                # .std does not work with a FileVariable
                                # var[:] turns var into a transientVariable which can be used in .std()
                                var = genutil.statistics.std(var[:], axis="({})".format(axis))
                            else:
                                print "Got {} as a transform method".format(method)
            if ('axis_order' in varSpec):
                indexOrder = varSpec['axis_order']
                axisOrder = var.getAxisIds()
                stringOrder = ''.join(["({})".format(axisOrder[i]) for i in indexOrder])
                var = var(order=stringOrder)
            all_vars.append(var)
        plot.loadVariable(all_vars)
        canvas = plot.getCanvas()
        windowId = self.getGlobalId(plot.getWindow())
        self._canvas[windowId] = canvas
        return [windowId]

    @exportRpc('vcs.canvas.clear')
    def clear(self, windowId):
        if windowId in self._canvas:
            self._canvas[windowId].clear()
            return True
        return False

    @exportRpc('vcs.canvas.resize')
    def resize(self, windowId, width, height):
        if windowId in self._canvas:
            canvas = self._canvas[windowId]
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

    # ======================================================================
    # Common elements routines
    @exportRpc('vcs.listelements')
    def listelements(self, typeName):
        """Returns a list of element names"""
        return vcs.listelements(typeName)

    @exportRpc('vcs.removeelement')
    def removeelement(self, typeName, name):
        """Removes the element [typeName, name]."""
        name = str(name)
        typeName = str(typeName)
        vcs.removeG(name, typeName)
        return True

    # ======================================================================
    # Colormap routines
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
        else:
            nameSource = str(nameSource)
        cm = vcs.createcolormap(name, nameSource)
        return cm.getindex().values()

    # ======================================================================
    # Graphics method routines
    @exportRpc('vcs.getallgraphicsmethods')
    def getallgraphicsmethods(self):
        """
        Returns a nested object representing all the available graphics method types as keys.
        Each graphics method type is an object that has the available graphics methods of that type as keys.
        Example:
        {
            boxfill: {
                polar: {...},
                default: {...}
            }
        }
        """
        _methods = {}
        for t in vcs.graphicsmethodlist():
            _methods[t] = {}
            for m in vcs.elements[t].keys():
                gm = vcs.elements[t][m]
                _methods[t][m] = vcs.dumpToDict(gm)[0]
                if hasattr(gm, "levels"):
                    arr = numpy.array(gm.levels)
                    if numpy.allclose(arr, 1e20) and arr.shape[-1] == 2:
                        _methods[t][m]["levels"] = [1e20, 1e20]
        return _methods

    @exportRpc('vcs.getgraphicsmethod')
    def getgraphicsmethod(self, typeName, name):
        """Returns the graphics method object"""
        typeName = str(typeName)
        name = str(name)
        gm = vcs.getgraphicsmethod(typeName, name)
        if (gm is None):
            raise ValueError('Cannot find graphics method [%s, %s]' % (typeName, name))
        propertyNames = [i for i in gm.__slots__ if not i[0] == '_' and hasattr(gm, i)]
        properties = {k:getattr(gm, k) for k in propertyNames}
        return properties

    @exportRpc('vcs.creategraphicsmethod')
    def creategraphicsmethod(self, typeName, name, nameSource):
        """Creates a graphicsmethod 'name' with type 'typeName' as a copy of 'nameSource'"""
        typeName = str(typeName)
        name = str(name)
        if (nameSource is None):
            nameSource = 'default'
        else:
            nameSource = str(nameSource)
        vcs.creategraphicsmethod(typeName, nameSource, name)
        return self.getgraphicsmethod(typeName, name)

    @exportRpc('vcs.getgraphicsmethodtypes')
    def getgraphicsmethodtypes(self):
        """Returns a list of available graphics methods"""
        return vcs.graphicsmethodlist()

    @exportRpc('vcs.getgraphicsmethodvariablecount')        
    def getgraphicsmethodvariablecount(self, typeName):
        """Returns the number of slabs expected by the graphics method type 'typeName'"""
        return vcs.xmldocs.obj_details['graphics method'][typeName]['slabs']

    @exportRpc('vcs.setgraphicsmethod')
    def setgraphicsmethod(self, typeName, name, nameValueMap):
        """Retrieves the graphics method of type 'typeName' with the name 'name' and applies the values in nameValueMap to it"""
        gm = vcs.getgraphicsmethod(typeName, name)
        updateGraphicsMethodProps(nameValueMap, gm)

    # ======================================================================
    # Template Method routines
    @exportRpc('vcs.getalltemplatenames')
    def gettemplates(self):
        """Returns a list of all available template names in sorted order"""
        template_list = sorted(vcs.elements['template'].keys(), key=lambda s: s.lower())
        return template_list

    @exportRpc('vcs.gettemplate')
    def gettemplate(self, templateName):
        """Returns the template as an object if it exists. Returns None otherwise. (None becomes null in js)"""
        if(templateName in vcs.elements['template'].keys()):
            template = vcs.dumpToDict(vcs.elements['template'][templateName])[0]
            return template
        else:
            return None
            
    @exportRpc('vcs.settemplate')
    def settemplate(self, name, newValues):
        """Finds the template 'name' and applies each value in newValues to it"""
        template = vcs.gettemplate(name)
        for outer_key in newValues:
            if isinstance(newValues[outer_key], dict):
                template_inner_obj = getattr(template, outer_key)
                for inner_name in newValues[outer_key]:
                    setattr(template_inner_obj, inner_name, newValues[outer_key][inner_name])
                    # Example: 
                    # if template = {'ymintic1': {'member': 'ymintic1', 'priority': 1, 'line': 'default'}}
                    # and new_values = {'ymintic1': {'member': 'ymintic1', 'priority': 0, 'line': 'default'}}
                    #
                    # template_inner_obj = {'member': 'ymintic1', 'priority': 1, 'line': 'default'}
                    # outername = 'ymintic1'
                    # inner_name = 'priority'
                    # 
                    # setattr would set template's ymintic1's priority to 0
                
    @exportRpc('vcs.createtemplate')
    def createtemplate(self, templateName, nameSource):
        """Creates a template with name 'templateName' using 'nameSource' as the base template"""
        base_template = vcs.gettemplate(nameSource)
        vcs.createtemplate(templateName, base_template)
            
    @exportRpc('vcs.removetemplate')
    def removetemplate(self, templateName):
        """Deletes the template named 'templateName' """
        template = vcs.gettemplate(templateName)
        vcs.removeP(template)

    @exportRpc('vcs.calculate')
    def calculate(self, new_operation):
        """
        Handles the process of deferring computation of calculations until plot time. 
        new_operation has one or more of the following keys: 'left_value', 'op', 'right_value'
        The 'op' key will contain a string representing the operation to perform. E.g. op: "+"
        The left and right values can represent constants or variables. Constants will have this structure:
        { 
            type: "constant",
            value: "2"
        }

        A variable will look something like this:
        {
            path: "~/sample_data/clt.nc",
            name: "clt",
            type: "variable",
            args: {
                latitude: [0,50],
                longitude: [80, 100]
            }
        }
        OR
        {
            json: "................."
        }

        The calculate function takes these arguments and uses the compute_graph and cdat_compute_graph packages
        to generate a computation tree which is then serialized to json for storage on the front end.
        When plotting, this json can be used to recreate the computation structure and calling .derive() will
        execute the requested operations. The resulting data can then be plotted. 
        """
        node = None
        if new_operation['op'] == 'regrid':
            left_value = getVariableNode(new_operation['left_value'])
            right_value = getVariableNode(new_operation['right_value'])
            if 'args' in new_operation and len(new_operation["args"].keys()) > 0:
                node = cdat_compute_graph.RegridFunction(left_value, right_value, args=new_operation['args'])
            else:
                node = cdat_compute_graph.RegridFunction(left_value, right_value)

        elif new_operation['op'] in compute_graph.arithmetic.binary_operators:
            left_value = getVariableNode(new_operation['left_value'])
            right_value = getVariableNode(new_operation['right_value'])
            node = compute_graph.ArithmeticOperation(new_operation['op'], left_value, right_value)
        if node:
            return compute_graph.dumpjson(node)
        else: 
            raise ValueError("Node should not be empty", new_operation)

    
def getVariableNode(variable_obj):
    if variable_obj['type'] == "constant":
        try:
            node = compute_graph.RawValueNode(int(variable_obj['value']))
        except ValueError:
            node = compute_graph.RawValueNode(float(variable_obj['value']))
        return node
        
    elif variable_obj['type'] == "variable":
        if "json" in variable_obj.keys():
            # If a json key exists, then this variable has already been loaded using cdat_compute_graph
            # All we need to do then is reconstruct the nodes from the json given,
            node = compute_graph.loadjson(variable_obj["json"])
        else:
            # If there is no json key, then the variable has not been loaded using cdat_compute_graph
            # We need to load the given variable from the file specified by the path,
                node = cdat_compute_graph.DatasetFunction(objtype="variable", uri=variable_obj['path'], id=variable_obj["name"])
        # After loading the variable, we need to apply any operations the user added post load.
        # E.g. Axis subsetting, or applying a standard deviation/average across an axis.
        # These operations are done seperately since they have to be editable on the front end.
        return applyOperations(node, variable_obj)
    else:
        raise TypeError("Invalid operand type: {}".format(variable_obj["type"]))

def applyOperations(node, varSpec):
    if "operations" in varSpec:
        for op in varSpec['operations']:
            if ('subRegion' in op):
                kargs = op['subRegion']
                node = cdat_compute_graph.geospatial.GeospatialFunction(func="subset", array=node, **kargs)
            # subSlice not implemented yet. Not sure if it actually used at all
            # elif ('subSlice' in op):
            #     kargs = op['subSlice']
            #     # fill in None with begin and end of the current axis
            #     for axis in kargs.keys():
            #         values = kargs[axis]
            #         newValues = values
            #         axisIndex = var.getAxisIndex(axis)
            #         if values[0] is None:
            #             newValues[0] = 0
            #         if values[1] is None:
            #             newValues[1] = var.shape[axisIndex] - 1
            #         kargs[axis] = slice(*newValues)
            #     var = var.subSlice(**kargs)
            # elif ('transform' in op):
            #     for axis in op["transform"]:
            #         method = op["transform"][axis]
            #         if method == "avg":
            #             var = cdutil.averager(var,axis="({})".format(axis))
            #         elif method == "std":
            #             # .std does not work with a FileVariable
            #             # var[:] turns var into a transientVariable which can be used in .std()
            #             var = genutil.statistics.std(var[:], axis="({})".format(axis))
            #         else:
            #             print "Got {} as a transform method".format(method)

    return node
