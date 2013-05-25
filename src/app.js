/*global require,console,d3*/


var root = this;


var _ = require('underscore');
var HgOverview = require('./src/hg-overview');


var ROOT_PATH = '~/src';


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

    chart
        .on('mouseover', function(d) {
          var c = chart.arc.centroid(d);
          var x = svg.x.invert(c[0]);
          var y = svg.y.invert(c[1]);
          var placement = c[1] > 0 ? 'top' : 'bottom';
          $(this)
              .popover({
                title: d.name,
                content: d.branch,
                trigger: 'manual',
                container: '.diagram',
                placement: placement
              })
              .popover('show');
              // grab the popover!
              // .data('popover')
                  // .applyPlacement({ left: x, top: y }, 'top');
        })
        .on('mouseout', function(d) {
          $(this).popover('destroy');
        });

    $scope.$watch('repos', function() {
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
