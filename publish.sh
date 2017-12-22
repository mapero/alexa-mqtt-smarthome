rm index.zip
zip -Xr index.zip node_modules
cd src
zip -ur ../index.zip *
echo "Zipped"
cd ..
aws lambda update-function-code --function-name alexa-smart-home --zip-file fileb://index.zip
