#!/bin/bash

ZIP_NAME=$1
rm -rf build/* "$ZIP_NAME"
npm i
npm run clean
npx -p typescript tsc
cp -r node_modules build/node_modules
cd build; zip -r ../"$ZIP_NAME" *; cd ..