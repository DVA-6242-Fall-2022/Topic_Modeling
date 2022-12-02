import React from 'react'
import { useEffect } from 'react'
import * as d3 from 'd3'
import { useRef } from 'react';

function drawGraph(data, selector){
  /* prepare the data - map to objects */
      var nodes = data.map(function(i) {
       var node = {};
         node.sleeve = i.type;
         node.group = i.group;
         node.groupName = i.group_name;
         node.count = i.count;
         node.radius = 1 * i.count;
         return node;
      });

      //labels for the axis
    var labels = [];
    //sleeve types list, used with colors
    var sleeveTypes = [];

    data.forEach(function(d){
      labels[d.group] = d.group_name;
      if(sleeveTypes.indexOf(d.type) === -1){
        sleeveTypes.push(d.type);
        }
      });

    var numClusters = labels.length;

    var color = d3.scaleSequential()
        .domain([0,sleeveTypes.length-1])
        .interpolator(d3.interpolateRainbow);
    
    //for legend
    var colorsDict = [];
    sleeveTypes.forEach(function(d){
      var element = {
          sleeve: d,
          color: color(sleeveTypes.indexOf(d)),
        }
      colorsDict.push(element);
      });

    var margin = {"left": 10, "right": 10,"top": 40,"bottom": 20}
    var width = 500 - margin.right - margin.left;
    var height = 500 - margin.top - margin.bottom;

    //size of the container div
    d3.select("#chart")
      .style("width", "300px")
      .style("height", "300px");

    /* draw the SVG - the viewBox and preserveAspectRatio attributes help make it responsive */
    var svg = d3.select(selector)
      .append('div')
      .classed('svg-container', true)
      .append('svg')
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 500 500")
      .classed('svg-content-responsive', true)
      .style("background-color", "#333");

    
    /* used to create the axis and also in the simulation as the center y coordinate for each cluster */
    var clusters = d3.scalePoint()
      .domain(d3.range(numClusters))
      .range([100,height-100]);

    var axis = d3.axisRight(clusters).ticks(numClusters);

    var gAxis = svg.append("g")
      .attr("transform", "translate(" + width/2 + ", " + 75 + ")")
      .attr("class", "axis axis--y")
      .call(axis);

    /* style the axis */
    var axis = d3.selectAll('.axis--y')
      .style("stroke", "#ffffff");

    var domain = d3.selectAll('.domain')		
      .style("stroke", "#ffffff");

    var ticks = d3.selectAll('.tick').selectAll('line')
      .style("stroke", "#ffffff");

    var tickText = d3.selectAll('.tick').selectAll('text')
      .style("font-size", "13px")
      .style("fill", "#fff")
      .text(function(d){return labels[d]});

    
    /* set up the force simulation - the center force for the clusters is on the left side of the SVG */
    var simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody())
        .force('collision', d3.forceCollide().radius(function(d){return d.radius;}))
        .force("center", d3.forceCenter(width / 4, 2*(height / 3)));


    /* draw the circles */
    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", function(d){return d.radius;})
        .attr("fill", function(d) { return color(sleeveTypes.indexOf(d.sleeve));});
          
    node.append("title")
        .text(function(d) { return d.sleeve; });

    simulation
      .nodes(nodes)
      .on("tick", ticked);
      
    function ticked() {
        var k = this.alpha() * 0.3;
        //move the nodes to their foci/cluster
        nodes.forEach(function(n, i) {
              n.y += (clusters(n.group) - n.y) * k;
              n.x += (0 - n.x) * k;
          });
        //update coordinates for the circle
        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      }

    /* legend */
    var legendBox = svg.append("g")
        .attr("class", "legend")
        .append("rect")
        .attr("x","365")
        .attr("y", "60")
        .attr("width", "125")
        .attr("height", height-60)
        .style("stroke", "#333")
        .style("fill", "#fff")
        .attr("opacity", "1.0");

    var title = svg.append("g")
      title
        .append("text")
        .attr("y", 80)
        .attr("x", 20)
        .text("Sleeves")
        .style("font-size", "80px")
        .style("fill", "#fff");

    var legend = svg.append("g")

      legend.selectAll("text")
        .data(colorsDict)
        .enter()
        .append("text")
        .attr("x", function(d,i){return 385;})
        .attr("y", function(d,i){return 100 + i*35;})
        .text(function(d){return d.sleeve;})
        .style("fill", function(d){return d.color})
        .style("font-weight", "bold")
        .style("font-size", "18px");
}

function MultiFociGraph() {
  const dev = useRef(false)
  const selector = useRef()
  
  const fetchDataAndDrawGraph = () => {
    fetch('https://dupes.s3.amazonaws.com/sleeves_multi_foci.json').then(res => {
      return res.json()
    }).then(data => {
      drawGraph(data, selector.current)
    }).catch(err => console.error(err))
  }

  useEffect(() => {
    if(!dev.current){
      dev.current = true
      fetchDataAndDrawGraph()
    }
  }, [])
  return (
    <div ref={selector}>MultiFociGraph</div>
  )
}

export default MultiFociGraph