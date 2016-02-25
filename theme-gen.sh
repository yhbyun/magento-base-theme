#! /bin/bash

if [ $# -ne 1 ]; then
    echo $0: usage: theme-gen.sh package/theme
    exit 1
fi

mkdir -p app/design/frontend/$1
mkdir -p skin/frontend/$1

svn export https://github.com/yhbyun/magento-base-theme/trunk/app/design/frontend/sample/default app/design/frontend/$1 --force 
svn export https://github.com/yhbyun/magento-base-theme/trunk/skin/frontend/sample/default skin/frontend/$1 --force 


