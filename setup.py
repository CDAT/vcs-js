from setuptools import setup, find_packages
import glob
import subprocess
import os


# Build the JS so vcs.js is ready for packaging
subprocess.check_call("npm run build", shell=True)

scripts = ["js/vcs.js", "js/vcs.js.map"]

setup(
    name="vcs_server",
    version="0.1",
    packages=find_packages(),
    scripts=glob.glob("scripts/*"),
    package_data={"vcs_server": scripts}
)
