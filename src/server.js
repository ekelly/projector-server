// Get credentials
var util = require('util');
var os = require('os');
var request = require('request');
var SerialPort = require("serialport").SerialPort;

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

var serialPort = new SerialPort(SERIAL_NAME, {
  baudRate: 9600,
  dataBits: 8,
  bufferSize: 255
});

function writeToSerialPort(data, error) {
  serialPort.write(data + "\r", function(err, results) {
    if (err) {
      error(err);
    }
  });
}

function getFromSerialPort(item, success, error) {
  d = '';
  serialPort.on("data", function(data) {
    d += data;
    if (data == ":") {
      success(d.split("=")[1].split(NULL)[0]);
    }
  });
  serialPort.write(item + "?\r", function(err, results) {
    if (err) {
      error(err);
    }
  });
}

function onError(err) {
  console.log(err);
}

function turnOn(callback) {
  writeToSerialPort(mapping["power"] + " " + data, callback);
}

function getProjectorPower(success, error) {
  getFromSerialPort(mapping["power"], function(data) {
    var english;
    switch(parseInt(data)) {
      case 0:
        english = "off";
        break;
      case 1:
        english = "on";
        break;
      case 2:
        english = "warming up";
        break;
      case 4:
        english = "cooling down";
        break;
      default:
        english = "unknown";
    }
    success(english);
  }, function(err) {
    onError(err);
    error(err);
  });
}

exports.getPowerStatus = getProjectorPower;
exports.turnOn = turnOn;
