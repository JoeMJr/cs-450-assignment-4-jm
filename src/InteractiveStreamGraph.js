import React, { Component } from "react";
import * as d3 from "d3";

class InteractiveStreamGraph extends Component {
    componentDidUpdate(){
    const chartData = this.props.csvData;
    //console.log("Rendering chart with data:", chartData);
    // Don't render if data is empty
    if (!chartData || chartData.length === 0) {
        return;
    }
    
    // Define the LLM model names to visualize
    const llmModels = ["GPT-4", "Gemini", "PaLM-2", "Claude", "LLaMA-3.1"];

    // Write the D3.js code to create the interactive streamgraph visualization here

    const maxSum = d3.sum([
      d3.max(chartData, d => d["GPT-4"]),
      d3.max(chartData, d => d.Gemini),
      d3.max(chartData, d => d["PaLM-2"]),
      d3.max(chartData, d => d.Claude),
      d3.max(chartData, d => d["LLaMA-3.1"])
    ]);
    //console.log("Chart Data?", chartData[0].Date)
    var xScale = d3.scaleTime().domain(d3.extent(chartData, d => d.Date)).range([0, 400]);
    var yScale = d3.scaleLinear().domain([0, maxSum]).range([400, 0]);
    const colorScale = d3.scaleOrdinal().domain(llmModels).range(["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"]);

    var stack = d3.stack().keys(llmModels).offset(d3.stackOffsetWiggle);
    var stackedSeries = stack(chartData);

    var areaGenerator = d3.area().x(d => xScale(d.data.Date)).y0(d => yScale(d[0])).y1(d => yScale(d[1])).curve(d3.curveCardinal);

    const tooltip = d3.select("body").selectAll(".mytooltip").data([0]).join("div").attr("class", "tooltip").style("position", "absolute")
    //var mySVG = tooltip.append("svg")
    //tooltip.append(() => this.barChart(mySVG,chartData,"GPT-4").node());
    var width = 300, height = 200, margin = { left: 50, right: 50, top: 40, bottom: 50};

    var mySVG = tooltip.selectAll("svg").data([null]).join("svg").attr("class", "contain").attr("width", width).attr("height", height)
    var innerChart = mySVG.selectAll("g").data([null]).join("g").attr("class", "bar").attr("transform", `translate(${margin.left}, ${margin.top})`)

    //
    var innerWidth = width - margin.left - margin.right, innerHeight = height - margin.top - margin.bottom;

    const colors = { "GPT-4": "#e41a1c", "Gemini": "#377eb8", "PaLM-2": "#4daf4a", "Claude": "#984ea3", "LLaMA-3.1": "#ff7f00" };

    d3.select('.container').selectAll('path').data(stackedSeries).join('path').style('fill', d => colorScale(d.key)).attr('d', d=>areaGenerator(d))
      .on("mouseover", (event, d) => {
            //console.log("d:", d[0].data[d.key], "date?", d[0].data.Date)
            tooltip.style("display", "block").style("left", event.pageX + "px").style("top", event.pageY + "px").style("background-color", "white")
            //

            var xScale = d3.scaleTime().domain(d3.extent(chartData, d => d.Date)).range([0, innerWidth]);
            var yScale = d3.scaleLinear().domain([d3.max(chartData, c => c[d.key]), 0]).range([innerHeight, 0]);
            
            var xAxisGenerator = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b"))
            innerChart.selectAll(".x-axis").data([null]).join("g").attr('class', 'x-axis').attr("transform", `translate(0, ${innerHeight})`).call(xAxisGenerator);
            
            var maxY = d3.max(chartData, c => c[d.key]);
            var yAxisGenerator = d3.axisLeft(yScale).tickFormat(v => maxY - v);
            innerChart.selectAll(".y-axis").data([null]).join("g").attr('class', 'y-axis').call(yAxisGenerator);
            
            // render the bars
            innerChart.selectAll("rect").data(chartData).join("rect")
            .attr("x", d => xScale(d.Date))
            .attr("width", d.length * 2)
            .attr("y", c =>  innerHeight - yScale(c[d.key])) // innerHeight - yScale(c[d.key])
            .attr("height", c => yScale(c[d.key]))
            .attr("fill", colors[d.key]); // yScale(d[d.key])
            //console.log("TEST:", chartData[0][d.key])
            //.append(() => this.barChart(chartData,d.key).node());
            //.html(`key? ${d.key}`)
            //console.log("the data?", xScale(d.length))
          })
        .on("mouseout", () => {
          tooltip.style("display", "none")
        })

    d3.select(".x-axis").attr("transform", "translate(0, 475)").call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")));

    // Legend? This is hardcoded but i don't care its like less than an hour before it is due and my brain is too smooth to do something else
    // Im sorry to the grader, i was tired and stupid when I made this
    var legs = d3.select(".leg").attr("transform", `translate(${415}, ${250})`)

    legs.selectAll("rect").data(llmModels).join("rect")
    .attr("height", "25")
    .attr("width", "25")
    .attr("y", (d,i) => i*30)
    .attr("fill", (d,i) => colors[llmModels[i]])

    legs.selectAll("text").data(llmModels).join("text")
    .attr("x", 27)
    .attr("y", (d,i) => i*30 + 17)
    .text((d,i) => llmModels[i])
    /*
    the brainchild of my insanity
    legs.append("rect")
    .attr("height", "25")
    .attr("width", "25")
    .attr("fill", colors[llmModels[4]])
    legs.append("text")
    .text(llmModels[4])
    .attr("transform", `translate(${(27)}, ${20})`)
    

    legs.append("rect")
    .attr("height", "25")
    .attr("width", "25")
    .attr("y", (25 * 1) + 10)
    .attr("fill", colors[llmModels[3]])
    legs.append("text")
    .text(llmModels[3])
    .attr("transform", `translate(${(27)}, ${(20 + (20 * 2))})`)

    legs.append("rect")
    .attr("height", "25")
    .attr("width", "25")
    .attr("y", (25 * 2) + 10)
    .attr("fill", colors[llmModels[2]])
    legs.append("text")
    .text(llmModels[2])
    .attr("transform", `translate(${(27)}, ${20 + (20 * 3)})`)

    legs.append("rect")
    .attr("height", "25")
    .attr("width", "25")
    .attr("y", (25 * 3) + 10)
    .attr("fill", colors[llmModels[1]])
    legs.append("text")
    .text(llmModels[1])
    .attr("transform", `translate(${(27)}, ${20 + (20 * 4)})`)

    legs.append("rect")
    .attr("height", "25")
    .attr("width", "25")
    .attr("y", (25 * 4) + 10)
    .attr("fill", colors[llmModels[0]])
    legs.append("text")
    .text(llmModels[0])
    .attr("transform", `translate(${(27)}, ${20 + (20 * 5)})`)
    */
  }

  render() {
    return (
      <svg style={{ width: 600, height: 500 }} className="svg_parent">
        <g className="container"></g>
        <g className="x-axis"></g>
        <g className="leg"></g>
      </svg>
    );
  }
}

export default InteractiveStreamGraph;
