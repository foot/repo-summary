var Stream = require('stream'),
    hg = require('hg');


var STREAM_TYPES = ['output', 'error', 'debug', 'result'];


var _createStreams = function(server) {
  var streams = {};

  STREAM_TYPES.forEach(function(streamName) {
    var s = streams[streamName] = new Stream();
    server.on(streamName, function(body, lines) {
      var data = lines.map(function(line) {
        return line.body;
      }).join('');

      s.emit('data', data);
    });
  });

  server.once('result', function(body, lines) {
    Object.keys(streams).forEach(function(name) {
      streams[name].emit('end');
    });
  });

  return streams;
};


var commandServer = function() {
  return new hg.HGCommandServer();
};


var runCommand = function(server, args) {
  var streams = _createStreams(server);
  server.runcommand.apply(server, args);
  return streams;
};


exports.commandServer = commandServer;
exports.runCommand = runCommand;
