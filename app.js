/*global require,console,d3*/


var root = this;


var _ = require('underscore');
var HgOverview = require('./hg-overview');


var ROOT_PATH = '/Users/simon/pld/3.0.1/';


root.MainCtrl = function($scope) {

    $scope.rootPath = ROOT_PATH;

    var dirs = [
        '/a/b/c',
        '/a/b',
        '/a/b/d',
        '/a/c/a',
        '/a/c/b',
        '/b',
        '/e/d/1/2/3/5/',
        '/e/d/f/g/h'
    ];

    var g = root.Graph();

    // var data = root.massageDirList(dirs);

    var fitToWindow = function() { 
        g.width($(this).width());
    };
    $(window).on('resize', fitToWindow);
    fitToWindow();

    $scope.update = function() {

        $scope.repos = [];

        HgOverview.getRepos($scope.rootPath, function(err, repos) {

            d3.select('.diagram')
                .datum(massageDirList(repos))
                .call(g);

            repos = repos.slice(1, 10);

            $scope.$apply(function() {
                $scope.repos = repos.map(function(path) {
                    return {
                        name: path.slice($scope.rootPath.length)
                    };
                });
            });

            HgOverview.getReposStatus(repos, function(err, path, summary) {
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
