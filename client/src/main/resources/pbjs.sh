#!/usr/bin/env bash

./node_modules/.bin/pbjs -t static-module -w commonjs -o ./src/modules/bundle.js --es6 ./../../../../proto/src/main/protobuf/proto/*.proto
