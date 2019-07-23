ZIP_NAME=payment-gateway-stripe-lambda.zip
rm -rf build/* "$ZIP_NAME"
npm i
npm run clean
tsc
cp -r node_modules build/node_modules
cd build; zip -r ../"$ZIP_NAME" *; cd ..