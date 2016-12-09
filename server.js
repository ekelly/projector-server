// Get credentials
var fs = require('fs');
var privateKey = fs.readFileSync('certs/server.key');
var certificate = fs.readFileSync('certs/server.crt');
var credentials = {key: privateKey, cert: certificate};

var util = require('util');
var request = require('request');
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
app.use(bodyParser.json());

var projector = require('src/projector.js');
projector.start();

// Logic

/*
   { "payload": "ON" }
*/

const HTTP_PORT = 8080;
const HTTPS_PORT = 8443;
const NULL = String.fromCharCode(0x0d);

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

app.get('/power', function(req, res) {
  projector.getPowerStatus(function(data) {
    console.log("Response from the projector after querying power: " + data);
    res.send("Projector is: " + data);
  });
});

app.post('/power', function(req, res) {
  console.log(req.body);
  var data = req.body.payload;
  if (data === "ON" || data === "OFF") {
    if (data === "ON") {
      projector.turnOn();
    } else {
      projector.turnOff();
    }
    sendReceiverCommand(data, callback);
  } else {
  }
  res.send("{\"success\":true}");
});

app.get('/mute', function(req, res) {
  projector.getMuteStatus(function(data) {
    console.log("Response from the projector after querying mute: " + data);
    res.send("Projector mute is: " + data);
  });
});

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(HTTP_PORT, function() { // Callback triggered when successfully listening
  console.log("Server listening on: http://localhost:%s\n", httpServer.address().port);
});
httpsServer.listen(HTTPS_PORT, function() { // Callback triggered when successfully listening
  console.log("Server listening on: https://localhost:%s\n", httpsServer.address().port);
});
