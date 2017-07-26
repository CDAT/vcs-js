import cdms2
import tornado
import json


class DataReader(tornado.web.RequestHandler):
    def set_default_headers(self):
        # Enable CORS for this endpoint
        self.set_header("Access-Control-Allow-Origin", "*")
        # * is in the spec, but we can't use it yet. Sigh.
        #self.set_header('Access-Control-Expose-Headers', 'X-Cdms-*')
        headers = ['Axis-Latitude', 'Axis-Longitude', 'Axis-Level', 'Axis-Time', 'Order', 'Dtype', 'Shape']
        self.set_header('Access-Control-Expose-Headers', ", ".join(["X-Cdms-" + h for h in headers]))
        self.set_header('Access-Control-Allow-Methods', 'GET, OPTIONS')

    def get(self):
        variable = self.get_argument("var_spec")
        spec = json.loads(variable)
        v = cdms2.open(spec['uri'])(spec['variable'])
        if isinstance(v, cdms2.avariable.AbstractVariable):
            axis_id_list = []
            for index, axis in enumerate(v.getAxisList()):
                # axis_json = axis.exportProvenance()
                axis_json = {}
                # Jam a little bit of extra info into the JSON for ease of use
                if axis.isLatitude():
                    header = "Latitude"
                    axis_json["axis"] = header.lower()
                elif axis.isLongitude():
                    header = "Longitude"
                    axis_json["axis"] = header.lower()
                elif axis.isLevel():
                    header = "Level"
                    axis_json["axis"] = header.lower()
                elif axis.isTime():
                    header = "Time"
                    axis_json["axis"] = header.lower()
                else:
                    header = axis.id
                    axis_json["axis"] = False
                axis_id_list.append(axis.id)
                self.set_header("X-Cdms-Axis-" + header, json.dumps(axis_json))
            self.set_header("X-Cdms-Order", "|".join(axis_id_list))
        self.set_header("X-Cdms-Shape", "|".join([str(c) for c in v.shape]))
        self.set_header("X-Cdms-Dtype", str(v.dtype))
        self.write(v[:].tobytes())

    def options(self):
        # no body
        self.set_status(204)
        self.finish()
