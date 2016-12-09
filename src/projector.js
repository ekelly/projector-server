// Get credentials
var util = require('util');
var os = require('os');
var request = require('request');
var serialport = require("serialport");

// Logic

/*
   { "payload": "ON" }
*/

var SERIAL_NAME;
switch (os.platform().toLowerCase()) {
  case 'linux':
    SERIAL_NAME = "/dev/ttyUSB0";
    break;
  case 'darwin':
    SERIAL_NAME = "/dev/tty.usbserial";
    break;
  default:
    SERIAL_NAME = "COM1";
    break;
}

const NULL = String.fromCharCode(0x0d);

const mapping = {
  "power": "PWR",
  "mute": "MUTE"
};

var serialPort;
function start() {
  serialPort = new serialport.SerialPort(SERIAL_NAME, {
    baudRate: 9600,
    dataBits: 8,
    bufferSize: 255,
    parser: serialport.parsers.readline(':')
  });
}

function writeToSerialPort(data, error) {
  serialPort.write(data + "\r", function(err, results) {
    if (err) {
      error(err);
    }
  });
}

function getFromSerialPort(item, success, error) {
  var dataCallback = function(data) {
    if (data) {
      success(data.split("=")[1].split(NULL)[0]);
      serialPort.removeListener("data", dataCallback);
    }
  };
  serialPort.on("data", dataCallback);
  serialPort.write(item + "?\r", function(err, results) {
    if (err) {
      error(err);
    }
  });
}

function errorCallback(callback) {
  return function(err) {
    onError(err);
    if (callback) {
      callback(err);
    }
  }
}

function onError(err) {
  console.log(err);
}

function turnOn(errorCallback) {
  writeToSerialPort(mapping["power"] + " ON", errorCallback);
}

function turnOff(errorCallback) {
  writeToSerialPort(mapping["power"] + " OFF", errorCallback);
}

const powerStates = ["off", "on", "warming up", "cooling down", "unknown"];
function getProjectorPower(success, error) {
  getFromSerialPort(mapping["power"], function(data) {
    console.log("Raw data: " + data);
    var english = powerStates[parseInt(data)];
    console.log("Projector is " + english);
    if (success) {
      success(english);
    }
  }, errorCallback(error));
}

const muteStates = {"ON": "on", "OFF": "off"};
function getProjectorMute(success, error) {
  getFromSerialPort(mapping["mute"], function(data) {
    var english = muteStates[data];
    console.log("Projector mute state: " + english);
    if (success) {
      success(english);
    }
  }, errorCallback(error));
}

exports.start = start;
exports.getPowerStatus = getProjectorPower;
exports.getMuteStatus = getProjectorMute;
exports.turnOn = turnOn;
exports.turnOff = turnOff;
