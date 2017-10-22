'use strict';

const MQTT_HOST = process.env.MQTT_HOST;
const MQTT_USER = process.env.MQTT_USER;
const MQTT_PASS = process.env.MQTT_PASS;
const MQTT_PREFIX = 'jochen/alexa/';

exports.handler = (request, context, callback) => {
  console.log(request);

};
