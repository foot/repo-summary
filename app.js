/*global angular,require,console*/


(function() {
"use strict";


var root = this;

var _ = require('underscore');

var hgOverview = require('./hg_overview');


var ROOT_PATH = '/Users/simon/pld/default/';


root.MainCtrl = function($scope) {

    $scope.rootPath = ROOT_PATH;

    $scope.update = function() {

        $scope.repos = [];

        hgOverview.getRepos($scope.rootPath, function(err, repos) {

            repos = repos.slice(1, 10);

            $scope.$apply(function() {
                $scope.repos = repos.map(function(path) {
                    return {
                        name: path.slice($scope.rootPath.length)
                    };
                });
            });

            hgOverview.getReposStatus(repos, function(err, path, summary) {
                $scope.$apply(function() {

                    var repo = _($scope.repos).find(function(r) {
                        return r.name == path.slice($scope.rootPath.length);
                    });

                    _(repo).extend(summary);

                    repo.dirty = repo.commit !== '(clean)';
                });
            });

        });
    };

    $scope.update();

};


}).call(this);
