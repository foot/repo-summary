/*global console,exports,require,module,$,process*/


(function() {
"use strict";


var root = this;


var _ = require('underscore');
var async = require('async');
var spawn = require('child_process').spawn;
var es = require('event-stream');
var cs = require('./hg-commandserver');

var hgSummary = function(server, repo, done) {
    var proc = spawn('hg', [ 'summary', '-R', repo ]);
    proc.stdout.setEncoding('utf8');
    proc.stdout
        .pipe(es.writeArray(function(err, array) {
            var text = array.join('').trim();
            var value = parseSummary(text);
            done(null, value);
        }));
};


var parseSummary = function(data) {
    
    var lines = data.trim().split('\n');
    var head = lines[0];
    var message = lines[1].trim();
    var rest = lines.slice(2);

    var d = _.object(rest.map(function(line) {
        return line.split(/:\s+/);
    }));
    d.header = head;
    d.message = message;
    d._data = data;

    return d;
};


var getSummary = function(server, repo, done) {

    cs.runCommand(server, [ '-R', repo, 'summary' ])
        .output
        .pipe(es.writeArray(function(err, array) {
            var text = array.join('').trim();
            var value = parseSummary(text);
            done(null, value);
        }));

};


var getRepos = function(path, callback) {

    path = path.replace(/^~/, process.env.HOME);

    var find = spawn('find', [
      path, '-type', 'd', '-name', '.hg', '-maxdepth', '3'
    ]);
    find.stdout.setEncoding('utf8');

    es.pipeline(
      find.stdout,
      es.split(),
      es.mapSync(function(line) {
        if (!line) {
          return;
        }

        var parts = line.split('/');
        return parts.slice(0, parts.length - 1).join('/');
      }),

      // not so pipey in the end.
      es.writeArray(function(err, array) {
        callback(err, array);
      })
    );
};


var _getReposStatus = function(server, repos, taskFinished, allFinished) {
  var tasks = repos.map(function(path) {
    return function(done) {
      getSummary(server, path, function(err, summary) {
        taskFinished(err, path, summary);
        done();
      });
    };
  });

  async.series(tasks, allFinished);
};


var getReposStatus = function(repos, callback, finished) {

  // split up the work across all the repos.
  var n = Math.min(5, repos.length);
  var l = Math.ceil(repos.length / n);
  var repoSlices = _.range(n).map(function(i) {
    return repos.slice(i * l, (i + 1) * l);
  });

  var tasks = repoSlices.map(function(repos) {
    var server = cs.commandServer();
    return function(done) {
      server.start(repos[0], function() {
        _getReposStatus(server, repos, callback, function() {
            server.stop();
            done();
        });
      });
    };
  });

  async.parallel(tasks, finished);
};


root.parseSummary = parseSummary;
root.getSummary = getSummary;
root.getRepos = getRepos;
root.getReposStatus = getReposStatus;


}).call(this);
