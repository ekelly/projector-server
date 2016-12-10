var util = require('util');
var request = require('request');

const RECEIVER_URL = "http://192.168.1.99/YamahaRemoteControl/ctrl";
const RECEIVER_DATA = "<YAMAHA_AV cmd=\"PUT\"><Main_Zone>" +
              "<Power_Control><Power>%s</Power></Power_Control></Main_Zone></YAMAHA_AV>\nName\n";
const commandMapping = {
  "ON": "On",
  "OFF": "Standby"
};

function sendReceiverCommand(command, errorCallback) {
  request.post({
    uri: RECEIVER_URL,
    body: util.format(RECEIVER_DATA, commandMapping[command])
  }, function(err, response, data) {
    if (err) {
      console.log("Request error");
      if (errorCallback) {
        errorCallback(err);
      }
    }
  });
}

function turnOn(error) {
  sendReceiverCommand("ON", error);
}

function turnOff(error) {
  sendReceiverCommand("OFF", error);
}

exports.turnOn = turnOn;
exports.turnOff = turnOff;

