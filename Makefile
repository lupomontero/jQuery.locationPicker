VERSION = $(shell cat version.txt)
PLUGIN_NAME=jquery.location-picker
SRC = src/${PLUGIN_NAME}.js
BUILD_DIR = build
DIST_DIR = ${BUILD_DIR}/dist

COMPRESSED = ${DIST_DIR}/${PLUGIN_NAME}-${VERSION}.min.js
COMPILED = ${DIST_DIR}/${PLUGIN_NAME}-${VERSION}.compiled.js

.PHONY: all

all: prepare jslint build

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

prepare: ${DIST_DIR}

preparedev:
	@echo "Linking dev src file to demo..."
	@rm -f demo/js/${PLUGIN_NAME}.js
	@ln src/${PLUGIN_NAME}.js demo/js/${PLUGIN_NAME}.js

jslint:
	@echo "\nRunning jslint (using node-jslint)"
	@jslint ${SRC}

build: prepare
	@echo "\nMinifying with YUI compressor..."
	@java -jar build/yuicompressor-2.4.2.jar ${SRC} \
		--charset utf-8 \
		--type js > ${COMPRESSED}
	@echo "Minified file created: "${COMPRESSED}
	@echo "Minified file compressed using gunzip."
	@echo "\nCompiling with Closure Compiler..."
	@java -jar build/closure-compiler.jar \
		--charset utf-8 \
		--summary_detail_level 3 \
		--js ${SRC} \
		--js_output_file ${COMPILED}
	@echo "Compiled file created: "${COMPILED}
	@echo "Linking compressed src file to demo..."
	@rm -f demo/js/${PLUGIN_NAME}.js
	@ln ${COMPRESSED} demo/js/${PLUGIN_NAME}.js

clean:
	@echo "\nRemoving built sources...."
	@rm -f ${COMPRESSED} ${COMPILED}

publishdemo:
	@rsync -e ssh --delete --rsh='ssh -p2222' -aruzP --exclude "*.swp" \
		demo/ \
		enoisecom@e-noise.com:/home/sites/enoisecom/demos/jQuery.locationPicker/
