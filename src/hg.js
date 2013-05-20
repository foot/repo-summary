var spawn = require('child_process').spawn;

var ls = spawn('ls');

ls.stdout.on('data', function(value) { console.log('stdout', arguments); });
ls.stderr.on('data', function(value) { console.log('stderr', arguments); });
ls.on('end', function(value) { console.log('end', arguments); });


var hg = require('hg-cmdserver');
var mercurial = require('mercurial');

// var server = hg.createServer('~/pld/default/vsp');
// console.log(server.statusJSON());

var repo = mercurial.open('/Users/simon/pld/default/vsp');
repo.log(function (err, result) {
  console.log(result);
  repo.close();
});
