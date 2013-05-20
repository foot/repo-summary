/*global require,console,d3*/


var root = this;


var _ = require('underscore');
var HgOverview = require('./src/hg-overview');


var ROOT_PATH = '/Users/simon/src/';


root.MainCtrl = function($scope) {

    $scope.rootPath = ROOT_PATH;

    var svg = root.newSvg('.diagram');
    var chart = root.newChart();
    var fitToWindow = function() { 
        svg.resize($(window).width(), 500);

        chart.width($(window).width());
        chart.height(500);
    };
    fitToWindow();
    $(window).on('resize', fitToWindow);


    $scope.$watch('repos', function(newVal, oldVal) {

      svg.datum(massageDirList($scope.repos))
          .call(chart);

    }, true);

    $scope.update = function() {

        $scope.repos = [];

        HgOverview.getRepos($scope.rootPath, function(err, repos) {

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
