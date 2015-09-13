var SerialPort = require("serialport").SerialPort
var http = require('http');

const PORT=8080;

// We want to be able to gracefully handle Ctrl-C
process.on("SIGINT", function() { process.exit(); });

// Replace /dev/tty with the correct name
var serialPort = new SerialPort("/dev/tty", {
    baudrate: 57600
});

function handleRequest(request, response) {
  var body = '';
  request.setEncoding('utf8');

  request.on('data', function(chunk) {
    body += chunk;
  });

  request.on('end', function() {
    try {
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
