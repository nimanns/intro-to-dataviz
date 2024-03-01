import * as d3 from "d3";
import file from "url:./data.csv";

// Set up the SVG canvas dimensions
var margin = { top: 20, right: 220, bottom: 30, left: 250 },
  width = 1800 - margin.left - margin.right,
  height = 1200 - margin.top - margin.bottom;

// Append SVG to the chart div
var svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Load the CSV file
d3.csv(file)
  .then(function (data) {
    // Print the data to the console to check

    // Scale functions
    var x = d3
      .scaleTime()
      .range([0, width])
      .domain(
        d3.extent(data, function (d) {
          return new Date(d.Occurred);
        })
      ); // Use "Occurred" column

    var y = d3
      .scaleBand()
      .range([height, 0])
      .domain(
        data.map(function (d) {
          return d["Country(ies)"];
        })
      )
      .padding(0.01);

    // Color scale for incident type
    var colorScale = d3
      .scaleOrdinal()
      .domain(["Incident", "Issue"])
      .range(["steelblue", "orange"]);

    // Group data by position to avoid overlapping circles
    var nestedData = Array.from(
      d3.group(data, (d) => x(new Date(d.Occurred)) + "-" + d["Country(ies)"])
    );

    // Add circles for each incident
    svg
      .selectAll(".circle-group")
      .data(nestedData)
      .enter()
      .append("g")
      .attr("class", "circle-group")
      .selectAll(".circle")
      .data(function (d) {
        return d[1];
      })
      .enter()
      .append("circle")
      .attr("class", "circle")
      .attr("cx", function (d, i) {
        if (isNaN(x(new Date(d.Occurred)) + i * 3)) {
          return -40;
        } else {
          return x(new Date(d.Occurred)) + i * 3;
        }
      }) // Adjust x-coordinate to be close to each other
      .attr("cy", function (d) {
        return y(d["Country(ies)"]) + y.bandwidth() / 2;
      })
      .attr("r", 15)
      .attr("fill", function (d) {
        return colorScale(d.Type);
      })
      .on("mouseover", function (d) {
        // Increase circle size and show tooltip on mouseover
        d3.select(this).transition().duration(200).attr("r", 11);
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            "Type: " +
              d.target.__data__.Type +
              "<br/>" +
              "Country: " +
              d.target.__data__["Country(ies)"] +
              "<br/>" +
              "Occurred: " +
              d.target.__data__.Occurred
          )
          // .style("left", (d3.event.pageX + 10) + "px")
          // .style("top", (d3.event.pageY - 28) + "px");
          .style("left", d3.select(this).attr("cx") + 480 + "px")
          .style("top", d3.select(this).attr("cy") + "px");
      })
      .on("mouseout", function (d) {
        // Reset circle size and hide tooltip on mouseout
        d3.select(this).transition().duration(200).attr("r", 15);
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Add the x-axis
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .attr("class", "x-axis");

    // Add the y-axis
    svg.append("g").call(d3.axisLeft(y)).attr("class", "y-axis");

    // Add tooltip
    var tooltip = d3
      .select("#chart")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  })
  .catch(function (error) {
    // Handle any errors that occur while loading the CSV file
    console.error("Error loading the data: " + error);
  });
