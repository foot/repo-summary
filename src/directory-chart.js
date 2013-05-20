

var _ = require('underscore');


var massageDirList = function(data) {
  var root = { name: 'root' };

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
        node.children.push(child);
      }

      node = child;
    });
  });

  return collapseRoot(root);
};


var collapseRoot = function(root) {
  var n = root,
      names = [];

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
      radius = function() { return Math.min(width, height) / 2; };

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

  var chart = function(selection) {
    selection.each(function(d, i) {
      var g = d3.select(this);

      var repository = g.selectAll("path")
          .data(partition.nodes);

      repository.enter().append("path");

      repository
          .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
          .attr("d", arc)
          .style("stroke", "#fff")
          .style("fill", function(d) { return color(d.branch); })
          .style("fill-rule", "evenodd");

      repository.exit().remove();
    });
  };

  chart.width = function(value) {
    width = value;
    return chart;
  };

  chart.height = function(value) {
    height = value;
    return chart;
  };

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
    svg = d3.select(container).append('svg').append('g');

    svg.resize = function(width, height) {
      baseSvgTransforms(svg, width, height);
    };

    return svg;
};


var exports = exports || this;


exports.newChart = newChart;
exports.massageDirList = massageDirList;
exports.collapseRoot = collapseRoot;
