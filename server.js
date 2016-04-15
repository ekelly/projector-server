// Get credentials
var fs = require('fs');
var privateKey = fs.readFileSync('certs/server.key');
var certificate = fs.readFileSync('certs/server.crt');
var credentials = {key: privateKey, cert: certificate};

var os = require('os');
var https = require('https');
var SerialPort = require("serialport").SerialPort;
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
app.use(bodyParser.json());

// Fake OAuth 2.0
app.get('/privacy', function(req, res) {
  res.send("No privacy whatsoever");
});

app.get('/login', function(req, res) {
  if (req.query.client_id)
    console.log("Client id: " + req.query.client_id);
  if (req.query.scope)
    console.log("scope: " + req.query.scope);
  if (req.query.redirect_uri) {
    console.log("Redirect: " + req.query.redirect_uri);
    res.redirect(res.query.redirect_uri);
  }
});

app.post('/token', function(req, res) {
  if (req.body.client_secret === "secret" &&
      req.body.client_id === "alexa-skill") {
    res.write('{"access_token":"RsT5OjbzRn430zqMLgV3Ia"}');
  } else {
    res.write('{"error":"invalid_request"}');
  }
});

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

var server = https.createServer(credentials, app);

server.listen(PORT, function() {
  // Callback triggered when successfully listening
  console.log("Server listening on: https://localhost:%s\n", server.address().port);
});
