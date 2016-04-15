// Get credentials
var fs = require('fs');
var privateKey = fs.readFileSync('certs/server.key');
var certificate = fs.readFileSync('certs/server.crt');
var credentials = {key: privateKey, cert: certificate};

var https = require('https');
var SerialPort = require("serialport").SerialPort;
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
app.use(bodyParser.json());

/*
   { "payload": "ON" }
*/

const MAC_TTY = "/dev/tty.usbserial";
const LINUX_TTY = "/dev/ttyUSB0";
const SERIAL_NAME = MAC_TTY;

const PORT=443;
const NULL=String.fromCharCode(0x0d);

const mapping = {
  "power": "PWR",
  "mute": "MUTE"
};

function createSerialPort(callback) {
  var serialPort = new SerialPort(SERIAL_NAME, {
      baudRate: 9600,
      dataBits: 8,
      bufferSize: 255
  });
  serialPort.on("open", function() {
    callback(serialPort);
  });
}

function writeToSerialPort(data, error) {
  createSerialPort(function(serialPort) {
    serialPort.write(data + "\r", function(err, results) {
      if (err) {
        error(err);
      }
    });
    serialPort.close(function() {});
  });
}

function getFromSerialPort(item, success, error) {
  createSerialPort(function(serialPort) {
    d = '';
    serialPort.on("data", function(data) {
      d += data;
      if (data == ":") {
        success(d.split("=")[1].split(NULL)[0]);
        serialPort.close(function() {});
      }
    });
    serialPort.write(item + "?\r", function(err, results) {
      if (err) {
        error(err);
        serialPort.close(function() {});
      }
    });
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
    writeToSerialPort(mapping["power"] + " " + data, function(err) {
      console.log(err);
    });
  } else {
  }
  res.send("");
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
  res.send("");
});

app.get('/privacy', function(req, res) {
  res.send("No privacy whatsoever");
});

var server = https.createServer(credentials, app);

server.listen(PORT, function() {
  // Callback triggered when successfully listening
  console.log("Server listening on: http://localhost:%s\n", server.address().port);
});
