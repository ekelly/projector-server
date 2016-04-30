// Get credentials
var fs = require('fs');
var privateKey = fs.readFileSync('certs/server.key');
var certificate = fs.readFileSync('certs/server.crt');
var credentials = {key: privateKey, cert: certificate};

var util = require('util');
var os = require('os');
var request = require('request');
var http = require('http');
var https = require('https');
var SerialPort = require("serialport").SerialPort;
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
app.use(bodyParser.json());

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

const HTTP_PORT = 8080;
const HTTPS_PORT = 8443;
const NULL = String.fromCharCode(0x0d);

const mapping = {
  "power": "PWR",
  "mute": "MUTE"
};

const RECEIVER_URL = "http://192.168.1.99/YamahaRemoteControl/ctrl";
const RECEIVER_DATA = "<YAMAHA_AV cmd=\"PUT\"><Main_Zone>" +
              "<Power_Control><Power>%s</Power></Power_Control></Main_Zone></YAMAHA_AV>\nName\n";
const commandMapping = {
  "ON": "On",
  "OFF": "Standby"
};

function sendReceiverCommand(command, error) {
  request.post({
    uri: RECEIVER_URL,
    body: util.format(RECEIVER_DATA, commandMapping[command])
  }, function(err, response, data) {
    if (err) {
      console.log("Request error");
      error(err);
    }
  });
}

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

app.get('/power', function(req, res) {
  getFromSerialPort(mapping["power"], function(data) {
    res.send(data);
  });
});

app.post('/power', function(req, res) {
  console.log(req.body);
  var data = req.body.payload;
  if (data === "ON" || data === "OFF") {
    var callback = function(err) {
      console.log(err);
    };
    writeToSerialPort(mapping["mute"] + " " + data, callback);
    // writeToSerialPort(mapping["power"] + " " + data, callback);
    sendReceiverCommand(data, callback);
  } else {
  }
  res.send("{\"success\":true}");
});

app.get('/mute', function(req, res) {
  getFromSerialPort(mapping["mute"], function(data) {
    res.send(data);
  }, function(err) {
    console.log(err);
  });
});

app.post('/mute', function(req, res) {
  console.log(req.body);
  var data = req.body.payload;
  if (data === "ON" || data === "OFF") {
    writeToSerialPort(mapping["mute"] + " " + data, function(err) {
      console.log(err);
    });
  } else {
  }
  res.send("{\"success\":true}");
});

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(HTTP_PORT, function() { // Callback triggered when successfully listening
  console.log("Server listening on: http://localhost:%s\n", httpServer.address().port);
});
httpsServer.listen(HTTPS_PORT, function() { // Callback triggered when successfully listening
  console.log("Server listening on: https://localhost:%s\n", httpsServer.address().port);
});
