// Get credentials
var fs = require('fs');
var privateKey = fs.readFileSync('certs/server.key');
var certificate = fs.readFileSync('certs/server.crt');
var credentials = {key: privateKey, cert: certificate};

var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
app.use(bodyParser.json());

var receiver = require('./receiver.js');
var projector = require('./projector.js');
projector.start();

// Logic

/*
   { "payload": "ON" }
*/

const HTTP_PORT = 8080;
const HTTPS_PORT = 8443;

app.get('/power', function(req, res) {
  projector.getPowerStatus(function(data) {
    console.log("Response from the projector after querying power: " + data);
    res.send("Projector is: " + data);
  });
});

app.post('/power', function(req, res) {
  console.log(req.body);
  var data = req.body.payload;
  switch(data) {
    case "ON":
      projector.turnOn();
      receiver.turnOn();
      break;
    case "OFF":
      projector.turnOff();
      receiver.turnOff();
      break;
    default:
      console.log("received unknown data: " + data);
      res.send("{\"success\":false}");
      return;
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
