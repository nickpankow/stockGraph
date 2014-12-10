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

var dateMin = new Date("2012-01-01")
   ,dateMax = new Date("2012-12-31");

d3.csv("data.csv", type, function(error, data) {
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

	chart.selectAll(".bar")
		.data(data)
	  .enter().append('svg:path')
	  .attr('d', lineFunc(data))
	  .attr("class", "line");
});

var lineFunc = d3.svg.line()
	.x(function(d) {
		return x(d.date);
	})
	.y(function(d) {
		return y(d.close);
	})
	.interpolate('linear');

function type(d){
	d.date = new Date(d.date.replace("/","-")); // Coerce to date
	d.close = +d.close; //coerce to number
	return d;
}
