#!/usr/bin/env bash
PKG_NAME=vcs-js
USER=uvcdat
echo "Trying to upload conda"
export PATH="$HOME/miniconda/bin:$PATH"
if [ `uname` == "Linux" ]; then
    OS=linux-64
    echo "Linux OS"
    conda update -y -q conda
else
    echo "Mac OS"
    OS=osx-64
fi

mkdir ~/conda-bld
conda install -q anaconda-client conda-build
conda config --set anaconda_upload no
export CONDA_BLD_PATH=${HOME}/conda-bld
export VERSION="2.12"
echo "Cloning recipes"
git clone git://github.com/UV-CDAT/conda-recipes
cd conda-recipes
# uvcdat creates issues for build -c uvcdat confises package and channel
rm -rf uvcdat
python ./prep_for_build.py
echo "Building now"
conda build $PKG_NAME -c uvcdat/label/nightly -c conda-forge -c uvcdat 
anaconda -t $CONDA_UPLOAD_TOKEN upload -u $USER -l nightly $CONDA_BLD_PATH/$OS/$PKG_NAME-$VERSION.`date +%Y`*_0.tar.bz2 --force

