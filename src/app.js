/* global $ */


var root = this;


var _ = require('underscore');
var hgoverview = require('./src/hg-overview');


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
            showTooltip(d, this, x, y);
        })
        .on('mouseout', function(d) {
            $(this).popover('destroy');
        });

    $scope.$watch('repos', function() {
        svg.datum(root.massageDirList($scope.repos))
            .call(chart);
    }, true);

    $scope.update = function() {

        $scope.repos = [];

        hgoverview.getRepos($scope.rootPath, function(err, repos) {

            $scope.$apply(function() {
                $scope.repos = repos.map(function(path) {
                    return {
                        name: path.slice($scope.rootPath.length)
                    };
                });
            });

            hgoverview.getReposStatus(repos, function(err, path, summary) {

                $scope.$apply(function() {

                    var repo = _($scope.repos).find(function(r) {
                        return r.name === path.slice($scope.rootPath.length);
                    });

                    _(repo).extend(summary);

                    repo.dirty = (repo.commit !== '(clean)');
                });
            });

        });
    };

    $scope.update();
};


var showTooltip = function(d, el, x, y) {

    var popover = $(el)
        .popover({
            title: d.name,
            content: d.branch,
            trigger: 'manual',
            container: '.diagram',
            placement: 'top'
        })
        .popover('show');

    var w = popover.data('popover').tip().width();
    var h = popover.data('popover').tip().height();

    popover
        .data('popover')
        .applyPlacement({ left: x - w * 0.5, top: y - 30 }, 'top');
};
