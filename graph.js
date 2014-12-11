var margin = {top: 20, right: 30, bottom: 80, left: 40},
	width = 1200 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var x = d3.time.scale()
	.range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom")
	.ticks(d3.time.month, 1)
	.tickFormat(d3.time.format("%B"));

var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left")
	.ticks(10);

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var dateMin = new Date("2013-01-01")
   ,dateMax = new Date("2013-12-31");

d3.csv("table_2013_avg.csv", type, function(error, data) {
	// x.domain(data.map(function(d) { return d.date; }));
	// x.domain([data[0].date,data[data.length - 1].date])
	x.domain([dateMin,dateMax])
	var yMax = d3.max(data, function(d) { return d.close; });
	y.domain([0, yMax + (yMax / 3)]);

	chart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-1.5em")
			.attr("dy", ".15em")
			.attr("transform", function(d) { return "rotate(-65)"});

	chart.append("g")
		.attr("class", "y axis")
		.call(yAxis)
	  .append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Close");

	chart.selectAll(".close")
		.data(data)
	  .enter().append('svg:path')
	  .attr('d', lineFunc(data))
	  .attr("class", "line close");

	chart.selectAll(".movingAvg")
		.data(data)
	  .enter().append('svg:path')
	  .attr('d', lineAvgFunc(data))
	  .attr("class", "line movingAvg")
});

var legendRectSize = 18;
var legendSpacing = 4;
var legendScale = d3.scale.ordinal()
	.domain(["Close","MovingAvg"])
	.range(["green", "red"]);

var legend = chart.selectAll(".svg")
	.data(legendScale.domain())
	.enter()
		.append('g')
		.attr("class", "legend")
		.attr("transform", function(d, i) {
			var legendHeight = legendRectSize + legendSpacing;
			var offset = legendHeight * legendScale.domain().length / 2;
			var horz = width - 100;
			var vert = i * legendHeight - offset;
			return "translate(" + horz + "," + vert + ")";
});

legend.append('rect')
	.attr("width", legendRectSize)
	.attr("height", legendRectSize)
	.attr("fill", legendScale)
	.attr("stroke", legendScale);

legend.append("text")
	.attr("x", legendRectSize + legendSpacing)
	.attr("y", legendRectSize - legendSpacing)
	.text(function(d) { return d; });

var lineFunc = d3.svg.line()
	.x(function(d) {
		return x(d.date);
	})
	.y(function(d) {
		return y(d.close);
	})
	.interpolate('linear');

var lineAvgFunc = d3.svg.line()
	.x(function(d) {
		return x(d.date);
	})
	.y(function(d) {
		return y(d.movingAvg);
	})
	.interpolate('linear');

function type(d){
	d.date = new Date(d.date.replace("/","-")); // Coerce to date
	d.close = +d.close; //coerce to number
	d.movingAvg = +d.movingAvg; // coerce to number
	return d;
}
