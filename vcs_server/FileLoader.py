from wslink import register as exportRpc
import numpy as np
import os
# import vtk modules.
import vtk
from vtk.web import protocols
# import vcs modules
import cdms2
import compute_graph
import cdat_compute_graph

class StringBuffer(object):
    def __init__(self):
        self._buf = ''

    def write(self, strText):
        self._buf += strText

    def getbuffer(self):
        return self._buf

    def clear(self):
        self._buf = ''


class FileLoader(protocols.vtkWebProtocol):
    """
    Cache open cdms2 files and list variables from a given data file.
    """
    _file_cache = {}

    def __init__(self, datadir='.'):
        protocols.vtkWebProtocol.__init__(self)
        self._datadir = datadir
        self._infobuf = StringBuffer()

    @exportRpc('cdat.file.allvariables')
    def allvariables(self, file_name):
        """Return a list of variables from the given file name."""
        reader = self.get_reader(file_name)
        outVars = {}
        for vname in reader.variables:
            var = reader.variables[vname]

            # Get a displayable name for the variable
            if hasattr(var, 'long_name'):
                name = var.long_name
            elif hasattr(var, 'title'):
                name = var.title
            elif hasattr(var, 'id'):
                name = var.id
            else:
                name = vname
            if hasattr(var, 'units'):
                units = var.units
            else:
                units = 'Unknown'
            axisList = []
            for axis in var.getAxisList():
                axisList.append(axis.id)
            lonLat = None
            if (var.getLongitude() and var.getLatitude() and
                    not isinstance(var.getGrid(), cdms2.grid.AbstractRectGrid)):
                # for curvilinear and generic grids
                # 1. getAxisList() returns the axes and
                # 2. getLongitude() and getLatitude() return the lon,lat variables
                lonName = var.getLongitude().id
                latName = var.getLatitude().id
                lonLat = [lonName, latName]
                # add min/max for longitude/latitude
                if (lonName not in outVars):
                    outVars[lonName] = {}
                lonData = var.getLongitude()[:]
                outVars[lonName]['bounds'] =\
                  [float(np.amin(lonData)), float(np.amax(lonData))]
                if (latName not in outVars):
                    outVars[latName] = {}
                latData = var.getLatitude()[:]
                outVars[latName]['bounds'] =\
                  [float(np.amin(latData)), float(np.amax(latData))]
            if (isinstance(var.getGrid(), cdms2.grid.AbstractRectGrid)):
                gridType = 'rectilinear'
            elif (isinstance(var.getGrid(), cdms2.hgrid.AbstractCurveGrid)):
                gridType = 'curvilinear'
            elif (isinstance(var.getGrid(), cdms2.gengrid.AbstractGenericGrid)):
                gridType = 'generic'
            else:
                gridType = None
            if (vname not in outVars):
                outVars[vname] = {}
            outVars[vname]['name'] = name
            outVars[vname]['shape'] = var.shape
            outVars[vname]['units'] = units
            outVars[vname]['axisList'] = axisList
            outVars[vname]['lonLat'] = lonLat
            outVars[vname]['gridType'] = gridType
            if ('bounds' not in outVars[vname]):
                outVars[vname]['bounds'] = None
        outAxes = {}
        for aname in reader.axes:
            axis = reader.axes[aname]

            # Get a displayable name for the variable
            if hasattr(axis, 'id'):
                name = axis.id
            else:
                name = aname
            if hasattr(axis, 'units'):
                units = axis.units
            else:
                units = 'Unknown'
            outAxes[aname] = {
                'name': name,
                'shape': axis.shape,
                'units': units,
                'modulo': axis.getModulo(),
                'moduloCycle': axis.getModuloCycle(),
                'data': axis.getData().tolist(),
                'isTime': axis.isTime()
            }
        return [outVars, outAxes]

    @exportRpc('cdat.file.variable')
    def variable(self, varSpec):
        """
        Return an array containing two objects. The first entry contains variable info and the second contains axis info
        """
        outVar = {}
        var = None
        if 'json' in varSpec:
            var = compute_graph.loadjson(varSpec['json']).derive()
        else: 
            reader = self.get_reader(varSpec['file_name'])
            var = reader.variables[varSpec['var_name']]
        # Get a displayable name for the variable
        if hasattr(var, 'long_name'):
            name = var.long_name
        elif hasattr(var, 'title'):
            name = var.title
        elif hasattr(var, 'id'):
            name = var.id
        elif name in varSpec:
            name = varSpec['name']
        else:
            name = "unknown_name"
        if hasattr(var, 'units'):
            units = var.units
        else:
            units = 'Unknown'
        axisList = []
        for axis in var.getAxisList():
            axisList.append(axis.id)
        lonLat = None
        if (var.getLongitude() and var.getLatitude() and
                not isinstance(var.getGrid(), cdms2.grid.AbstractRectGrid)):
            # for curvilinear and generic grids
            # 1. getAxisList() returns the axes and
            # 2. getLongitude() and getLatitude() return the lon,lat variables
            lonName = var.getLongitude().id
            latName = var.getLatitude().id
            lonLat = [lonName, latName]
            # add min/max for longitude/latitude
            outVar[lonName] = {}
            outVar[latName] = {}
            lonData = var.getLongitude()[:]
            outVar[lonName]['bounds'] =\
                [float(np.amin(lonData)), float(np.amax(lonData))]
            latData = var.getLatitude()[:]
            outVar[latName]['bounds'] =\
                [float(np.amin(latData)), float(np.amax(latData))]
        if (isinstance(var.getGrid(), cdms2.grid.AbstractRectGrid)):
            gridType = 'rectilinear'
        elif (isinstance(var.getGrid(), cdms2.hgrid.AbstractCurveGrid)):
            gridType = 'curvilinear'
        elif (isinstance(var.getGrid(), cdms2.gengrid.AbstractGenericGrid)):
            gridType = 'generic'
        else:
            gridType = None
        
        outVar['name'] = name
        outVar['shape'] = var.shape
        outVar['units'] = units
        outVar['axisList'] = axisList
        outVar['lonLat'] = lonLat
        outVar['gridType'] = gridType
        if ('bounds' not in outVar):
            outVar['bounds'] = None
        outAxes = {}
        
        for axis in var.getAxisList():
            # Get a displayable name for the variable
            if hasattr(axis, 'id'):
                name = axis.id
            else:
                name = "Unknown-axis"
            if hasattr(axis, 'units'):
                units = axis.units
            else:
                units = 'Unknown'
            outAxes[name] = {
                'name': name,
                'shape': axis.shape,
                'units': units,
                'modulo': axis.getModulo(),
                'moduloCycle': axis.getModuloCycle(),
                'data': axis.getData().tolist(),
                'isTime': axis.isTime()
            }
        return [outVar, outAxes]

    @exportRpc('cdat.file.var.info')
    def getvarinfofromfile(self, file_name, var_name=None):
        """
        Return the info() from the file and variable (as a string), unless
        var_name is None, in which case return a dictionary mapping variable
        names to their info()."""
        reader = self.get_reader(file_name)

        def get_var_info(var):
            self._infobuf.clear()
            reader(var).info(device=self._infobuf)
            return self._infobuf.getbuffer()

        if not var_name:
            result = {}
            for variable in reader.variables:
                try:
                    result[variable] = get_var_info(variable)
                except:
                    result[variable] = 'Error getting var info for %s' % variable
            return result

        return get_var_info(var_name)

    @exportRpc('cdat.file.can_open')
    def can_open(self, file_name):
        """Try to open the given file."""
        full_path = file_name  # append data dir prefix
        if not file_name.startswith('http'):
            full_path = os.path.join(self._datadir, file_name)

        if file_name not in self._file_cache:
            self._file_cache[file_name] = cdms2.open(full_path)

        return file_name in self._file_cache

    def get_reader(self, file_name):
        if self.can_open(file_name):
            return self._file_cache[file_name]
        else:
            raise Exception('cannot open file at ' + file_name)
