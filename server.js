var SerialPort = require("serialport").SerialPort
var http = require('http');

const PORT=8080;

function writeToSerialPort(data) {
  // Replace /dev/tty with the correct name
  var serialPort = new SerialPort("/dev/tty", {
      baudRate: 9600,
      dataBits: 8,
      bufferSize: 255
  });
  serialPort.on("open", function() {
    serialPort.write(data + "\r", function(err, results) {
      console.log('err ' + err);
      console.log('results ' + results);
    });
    serialPort.close(function() {});
  });
}

function handleRequest(request, response) {
  var body = '';
  request.setEncoding('utf8');

  request.on('data', function(chunk) {
    body += chunk;
  });

  request.on('end', function() {
    try {
      writeToSerialPort("PWR OFF");
      var data = JSON.parse(body);
      var test = data["test"];
      response.write(test);
      console.log("received: " + data);
    } catch (err) {
      // bad json
      response.statusCode = 400;
      return response.end('error: ' + err.message);
    }

    response.end();
  });

}

var server = http.createServer(handleRequest);
server.listen(PORT, function() {
  // Callback triggered when successfully listening
  console.log("Server listening on: http://localhost:%s\n", PORT);
});
