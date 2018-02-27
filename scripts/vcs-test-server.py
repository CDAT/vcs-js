#!/usr/bin/env python

import argparse, json, os

# import vtk modules.
import vtk
from vtk.web import protocols
from vtk.web import wslink as vtk_wslink
from wslink import server


# import protocols
import vcs_server
from vcs_server.Visualizer import Visualizer
from vcs_server.FileLoader import FileLoader
import pkg_resources
import tempfile
import os
import shutil


def readConfigFile(configPath):
    fullPath = configPath
    if not os.path.isfile(fullPath):
        fullPath = os.path.join(os.getcwd(), configPath)

    with open(fullPath, 'r') as configFile:
        config = json.load(configFile)

    return config

class _VCSTestServer(vtk_wslink.ServerProtocol):

    # Application configuration
    rootDir = "."
    authKey = "wslink-secret"

    @staticmethod
    def configure(args):
        _VCSTestServer.authKey = args.authKey

        if args.config:
            _VCSTestServer.config  = args.config
        else:
            _VCSTestServer.config  = os.path.join(os.getcwd(), 'config', 'scripts', 'config.json')

        config = readConfigFile(_VCSTestServer.config)

        if 'vtkwebListenHost' in config:
            args.host = config['vtkwebListenHost']
        else:
            print('Could not get host from config file, using default')

        if 'vtkwebListenPort' in config:
            args.port = config['vtkwebListenPort']
        else:
            print('Could not get port from config file, using default')

    @staticmethod
    def add_arguments(parser):
        parser.add_argument("--config", default=None, help="path to config file", dest="config")

    def initialize(self):
        self.registerVtkWebProtocol(protocols.vtkWebMouseHandler())
        self.registerVtkWebProtocol(protocols.vtkWebViewPort())
        self.registerVtkWebProtocol(protocols.vtkWebViewPortImageDelivery())
        self.registerVtkWebProtocol(protocols.vtkWebFileBrowser(self.rootDir, 'Home'))
        self.registerVtkWebProtocol(FileLoader(self.rootDir))
        self.registerVtkWebProtocol(Visualizer())

        # Update authentication key to use
        self.updateSecret(_VCSTestServer.authKey)

if __name__ == "__main__":
    # Create argument parser
    parser = argparse.ArgumentParser(description="VCS Test Server")

    server.add_arguments(parser)
    _VCSTestServer.add_arguments(parser)
    args = parser.parse_args()

    _VCSTestServer.configure(args)

    # Start server
    server.start_webserver(options=args, protocol=_VCSTestServer)

