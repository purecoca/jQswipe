SRC_DIR = .
BUILD_DIR = build
PREFIX = .
DIST_DIR = ${PREFIX}/dist/

SRC_FILES = ${SRC_DIR}/jqswipe.js

RELEASE_TYPE = -dev
VERSION = `cat version.txt`${RELEASE_TYPE}
LAST_COMMIT=`git log -1 | grep Date: | sed 's/[^:]*: *//'`

JQSWIPE = ${DIST_DIR}jqswipe.js
JQSWIPE_MIN = ${DIST_DIR}jqswipe.min.js


MINJAR = java -jar ${BUILD_DIR}/yuicompressor-2.4.2.jar --charset=utf-8
VER = sed s/@VERSION/${VERSION}/
DATE = sed 's/@DATE/'"${LAST_COMMIT}"'/'
all: jqswipe min

jqswipe: ${JQSWIPE}

min: ${JQSWIPE_MIN}

${JQSWIPE}: ${SRC_FILES} ${DIST_DIR}
	@@echo "Building ${JQSWIPE} ..."
	@@cat ${SRC_FILES} | ${VER} | ${DATE} > ${JQSWIPE}
	@@echo "built!"

${JQSWIPE_MIN}: ${JQSWIPE}
	@@echo "Compressing ${JQSWIPE} ..."
	@@${MINJAR} ${JQSWIPE} > ${JQSWIPE_MIN}
	@@echo ${JQSWIPE_MIN} built!

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

clean:
	@@rm -rf ${DIST_DIR}
	@@echo "cleaned"