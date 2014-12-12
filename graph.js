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

var csvData = null;

d3.csv("table_2013_avg.csv", type, function(error, data) {
	// x.domain(data.map(function(d) { return d.date; }));
	// x.domain([data[0].date,data[data.length - 1].date])

	if (error || data == null){
		console.log("Error loadng data!");
		d3.select("error").html("Error loading data: " + error);
		return;
	}

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
	  .attr("class", "line movingAvg");

	csvData = data;
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
	d.date = new Date(d.date.replace(/\//g, "-")); // Coerce to date
	d.close = +d.close; //coerce to number
	d.movingAvg = +d.movingAvg; // coerce to number
	return d;
}


// Mouse over stuff
var focus = chart.append("g")
    .style("display", "none");

focus.append("circle")
	.attr("class", "y")
	.style("fill", "none")
	.style("stroke", "blue")
	.attr("r", 4);

chart.append("rect")
	.attr("width", width)
	.attr("height", height)
	.style("fill", "none")
	.style("pointer-events", "all")
	.on("mouseover", function() { focus.style("display", null); })
	.on("mouseout", function() { focus.style("display", "none"); })
	.on("mousemove", mousemove);

var bisectDate = d3.bisector(function(d) { return d.date; }).left;

function mousemove() {
	if (csvData == undefined || csvData.length == 0) {
		console.log("Data error!");
		return;
	}
	var x0 = x.invert(d3.mouse(this)[0]),
		i = bisectDate(csvData, x0, 1),
		d0 = csvData[i - 1],
		d1 = csvData[i],
		d = x0 - d0.date > d1.date - x0 ? d1 : d0;

	focus.select("circle.y")
		.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");

	// focus.select("text.y1")
	// 	.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")")
	// 	.text("Close: " + d.close);
	focus.select("text.y2")
		.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")")
		.text("Close: " + d.close);
	// focus.select("text.y3")
	// 	.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")")
	// 	.text(formatDate(d.date));
	focus.select("text.y4")
		.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")")
		.text("Date: " + formatDate(d.date));

	focus.select("text.y5")
		.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")")
		.text("Moving Avg: " + d.movingAvg);

	focus.select(".x")
		.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")")
		.attr("y2", height - y(d.close));
	focus.select(".y")
		.attr("transform", "translate(" + width * -1 + "," + y(d.close) + ")")
		.attr("x2", width + width);
}

// Mouse over tooltip
var formatDate = d3.time.format("%d-%b");
focus.append("line")
	.attr("class", "y")
	.style("stroke", "blue")
	.style("stoke-dasharray", "3,3")
	.style("opacity", 0.5)
	.attr("x1", width)
	.attr("x2", width);

// focus.append("text")
// 	.attr("class", "y1")
// 	.style("stroke", "white")
// 	.style("stroke-width", "3.5px")
// 	.style("opacity", 0.8)
// 	.attr("dx", 8)
// 	.attr("dy", "-.3em");

focus.append("text")
	.attr("class", "y2")
	.attr("dx", 8)
	.attr("dy", "-2em");

// focus.append("text")
// 	.attr("class", "y3")
// 	.attr("stroke", "white")
// 	.style("stroke-width", "3.5px")
// 	.style("opacity", 0.8)
// 	.attr("dx", 8)
// 	.attr("dy", "1em");

focus.append("text")
	.attr("class", "y4")
	.attr("dx", 8)
	.attr("dy", "-3em");

focus.append("text")
	.attr("class", "y5")
	.attr("dx", 8)
	.attr("dy", "-1em");