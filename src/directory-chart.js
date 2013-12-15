/* global d3 */


var _ = require('underscore');


var massageDirList = function(data) {

    var root = {name: 'root'};

    data.forEach(function(d) {

        var path = d.name;
        var node = root;

        path.split('/').filter(Boolean).forEach(function(elem) {

            if (!node.children) {
                node.children = [];
            }

            var index = node.children
                .map(function(c) { return c.name; })
                .indexOf(elem);

            var child = node.children[index];

            if (!child) {
                child = _.clone(d);
                child.name = elem;
                node.children.push(child);
            }

            node = child;
        });
    });

    return collapseRoot(root);
};


var collapseRoot = function(root) {
    var n = root;
    var names = [];

    while (n.children && n.children.length === 1) {
        names.push(n.name);
        n = n.children[0];
    }
    names.push(n.name);

    return {
        name: names.join('/'),
        children: n.children
    };
};


var newChart = function() {

    var width = 500,
        height = 500,
        color = d3.scale.category20c(),
        radius = function() { return Math.min(width, height) / 2; },
        listeners = [];

    var partition = d3.layout.partition()
        .value(function(d) { return 1; });

    var x = d3.scale.linear()
        .range([0, 2 * Math.PI]);

    var y = d3.scale.linear()
        .range([radius() * 0.5, radius()]);

    var arc = d3.svg.arc()
        .startAngle(function(d) { return x(d.x); })
        .endAngle(function(d) { return x(d.x + d.dx); })
        .innerRadius(function(d) { return y(d.y); })
        .outerRadius(function(d) { return y(d.y + d.dy); });

    var attachEvents = function(selection) {
        listeners.forEach(function(config) {
            selection.on(config.event, config.listener);
        });
    };

    var chart = function(selection) {
        selection.each(function(d, i) {
            var g = d3.select(this);

            var repository = g.selectAll("path")
                .data(partition.nodes);

            repository.enter().append("path")
                .call(attachEvents);

            repository
                .classed('repo', true)
                // hide inner ring
                .attr("display", function(d) { return d.depth ? null : "none"; })
                .attr("d", arc)
                .style("stroke", "#fff")
                .style("fill", function(d) { return color(d.branch); })
                .style("fill-rule", "evenodd");

            repository.exit().remove();
        });
    };

    chart.on = function(eventName, listener) {
        listeners.push({ event: eventName, listener: listener });
        return chart;
    };

    chart.width = function(value) {
        width = value;
        return chart;
    };

    chart.height = function(value) {
        height = value;
        return chart;
    };

    chart.arc = arc;

    return chart;
};


var baseSvgTransforms = function(g, width, height) {
    g.attr("transform", "translate(" + width / 2 + "," + height * 0.5 + ")");

    d3.select(g[0][0].parentNode)
        .attr("width", width)
        .attr("height", height);

    return g;
};


var newSvg = function(container) {

    var svg = d3.select(container).append('svg').append('g');

    var setScale = function(width, height) {

        svg.x = d3.scale.linear()
            .domain([ 0, width ])
            .range([ width * -0.5, width * 0.5 ]);

        svg.y = d3.scale.linear()
            .domain([ 0, height ])
            .range([ height * -0.5, height * 0.5 ]);

        baseSvgTransforms(svg, width, height);
    };

    svg.resize = setScale;

    return svg;
};


var exports = exports || this;


exports.newChart = newChart;
exports.massageDirList = massageDirList;
exports.collapseRoot = collapseRoot;
