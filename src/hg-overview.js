/*global console,exports,require,module,$*/


(function() {
"use strict";


var root = this;


var _ = require('underscore');
var async = require('async');
var spawn = require('child_process').spawn;
var hgSummary = function(repoPath, filename, range) {
    return spawn('hg', [ 'summary', '-R', repoPath ]);
};


var getOutput = function(proc, cb) {

    [ proc.stdout, proc.stderr ].forEach(function(stream) {
        stream.setEncoding('utf8');
    });

    var stdout = '';
    var stderr = '';

    var stdoutEnd = false;
    var stderrEnd = false;
    var done = function() {
        if (stdoutEnd && stderrEnd) {
            cb(stderr, stdout);
        }
    };

    proc.stdout.on('data', function(data) {
        stdout = stdout + data;
    });
    proc.stderr.on('data', function(data) {
        stderr = stderr + data;
    });
    proc.stderr.on('end', function() {
        stderrEnd = true;
        done();
    });
    proc.stdout.on('end', function() {
        stdoutEnd = true;
        done();
    });

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


var getSummary = function(path, callback) {
    getOutput(hgSummary(path), function(err, output) {
        callback(err.trim(), parseSummary(output.trim()));
    });
};


var getRepos = function(path, callback) {
    var find = spawn('find', [ path, '-name', '.hg', '-maxdepth', '3' ]);

    getOutput(find, function(err, output) {
        var repos = output.trim().split('\n').map(function(line) {
            var parts = line.split('/');
            return parts.slice(0, parts.length - 1).join('/');
        });
        callback(err, repos);
    });
};


var getReposStatus = function(repos, callback, finished) {
    async.parallelLimit(repos.map(function(path) {
        return function(done) {
            getSummary(path, function(err, summary) {
                done();
                callback(err, path, summary);
            });
        };
    }), 4, finished);
};


root.parseSummary = parseSummary;
root.getSummary = getSummary;
root.getRepos = getRepos;
root.getReposStatus = getReposStatus;


}).call(this);
