'use strict';

const MQTT = require('mqtt');

const MQTT_HOST = process.env.MQTT_HOST;
const MQTT_USER = process.env.MQTT_USER;
const MQTT_PASS = process.env.MQTT_PASS;
const MQTT_PREFIX = 'jochen/alexa/';

class MqttBridge {

  constructor(requestId) {
    this.requestId = requestId;
    this.responseTopic = `${MQTT_PREFIX}${this.requestId}/response`;
    this.requestTopic = `${MQTT_PREFIX}${this.requestId}/request`;
  }

  connect() {
    return new Promise( (resolve, reject) => {
      this.client = MQTT.connect( MQTT_HOST, {
        username: MQTT_USER,
        password: MQTT_PASS,
        clientId: 'alexa-smart-home',
        rejectUnauthorized: false,
      });
      this.client.once('connect', resolve);
      this.client.once('error', reject);
    });
  };

  publish(request) {
    return new Promise( (resolve, reject) => {
      this.client.publish(this.requestTopic, JSON.stringify(request), (err) => {
        if (err) reject(err);
        else resolve();
      });
    })
  }

  subscribe() {
    return new Promise( (resolve, reject) => {
      this.client.subscribe(this.responseTopic,
        {qos: 2},
        (err, granted) => {
          if (err) reject(err);
          else resolve(granted);
        }
      );
    })
  };

  waitForResponse() {
    return new Promise( (resolve, reject) => {
      this.client.once('message', (topic, message) => {
        if(topic !== this.responseTopic) reject('Wrong topic');
        else resolve(message);
      });
    });
  };

  finish() {
    this.client.end();
  }

};

exports.handler = (request, context, callback) => {
  const bridge = new MqttBridge(request.directive.header.messageId);
  bridge.connect().then( () => {
    console.log('Connect successful')
    return bridge.subscribe();
  }).then( () => {
    console.log("Successful subscribed");
    return Promise.all([bridge.waitForResponse(), bridge.publish(request)]);
  }).then( (results) => {
    bridge.finish();
    context.succeed(JSON.parse(results[0]));
  }).catch( (err) => {
    console.log(err);
    bridge.finish();
  });
};
