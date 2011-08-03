VERSION = $(shell cat version.txt)

SRC = src/jquery.location-picker.js
BUILD_DIR = build
DIST_DIR = ${BUILD_DIR}/dist

COMPRESSED = ${DIST_DIR}/jquery.location-picker-${VERSION}.min.js
COMPILED = ${DIST_DIR}/jquery.location-picker-${VERSION}.compiled.js

.PHONY: all

all: prepare jslint minify compile

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

prepare: ${DIST_DIR}

jslint:
	@echo "\nRunning jslint (using node-jslint)"
	@jslint ${SRC}

minify: prepare
	@echo "\nMinifying with YUI compressor..."
	@java -jar build/yuicompressor-2.4.2.jar ${SRC} \
		--charset utf-8 \
		--type js > ${COMPRESSED}
	@echo "Minified file created: "${COMPRESSED}
	@gzip -c ${COMPRESSED} > ${COMPRESSED}.gz
	@echo "Minified file compressed using gunzip."

compile: prepare
	@echo "\nCompiling with Closure Compiler..."
	@java -jar build/closure-compiler.jar \
		--charset utf-8 \
		--summary_detail_level 3 \
		--js ${SRC} \
		--js_output_file ${COMPILED}
	@echo "Compiled file created: "${COMPILED}

clean:
	@echo "\nNothing to clean up."

publishdemo:
	@rsync -e ssh --delete --rsh='ssh -p2222' -aruzP --exclude "*.swp" \
		demos/ \
		enoisecom@e-noise.com:/home/sites/enoisecom/demos/jQuery.locationPicker/
