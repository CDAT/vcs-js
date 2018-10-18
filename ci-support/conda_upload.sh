#!/usr/bin/env bash
PKG_NAME=vcs-js
USER=cdat
echo "Trying to upload conda"
export PATH="$HOME/miniconda/bin:$PATH"
if [ $(uname) == "Linux" ]; then
    OS=linux-64
    echo "Linux OS"
else
    echo "Mac OS"
    OS=osx-64
fi

mkdir ~/conda-bld
conda install -q anaconda-client=1.6.5 conda-build=3.0.27
conda config --set anaconda_upload no
export CONDA_BLD_PATH=${HOME}/conda-bld
export VERSION="*"
echo "Cloning recipes"
git clone git://github.com/CDAT/conda-recipes
cd conda-recipes
python ./prep_for_build.py
echo "Building now"
conda build $PKG_NAME -c cdat/label/nightly -c conda-forge -c cdat 
anaconda -t $CONDA_UPLOAD_TOKEN upload -u $USER -l nightly $CONDA_BLD_PATH/$OS/$PKG_NAME-$VERSION.$(date +%Y)*_0.tar.bz2 --force

