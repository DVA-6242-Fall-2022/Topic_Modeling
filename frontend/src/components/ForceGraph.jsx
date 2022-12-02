import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
// import data from '../topicData.csv'

function ForceGraph({data, year, selected, handleSelection}) {
  const svgRef = useRef()
  const dev = useRef(false)

  // const margin = {top: 50, right: 60, bottom: 50, left: 80};

  // const width = window.screen.width - margin.left - margin.right;
  // const height = window.screen.height - margin.top - margin.bottom;


  useEffect(() => {
    if(!dev.current){
      dev.current = true
      // bubbleChart creation function; instantiate new bubble chart given a DOM element to display it in and a dataset to visualise
      function bubbleChart() {
        const width = 300;
        const height = 300;
      
        // location to centre the bubbles
        const centre = { x: width/2, y: height/2 };
      
        // strength to apply to the position forces
        const forceStrength = 0.03;
      
        // these will be set in createNodes and chart functions
        let svg = null;
        let bubbles = null;
        let labels = null;
        let nodes = [];
      
        // charge is dependent on size of the bubble, so bigger towards the middle
        function charge(d) {
          return Math.pow(d.radius, 2.0) * 0.01
        }
      
        // create a force simulation and add forces to it
        const simulation = d3.forceSimulation()
          .force('charge', d3.forceManyBody().strength(charge))
          // .force('center', d3.forceCenter(centre.x, centre.y))
          .force('x', d3.forceX().strength(forceStrength).x(centre.x))
          .force('y', d3.forceY().strength(forceStrength).y(centre.y))
          .force('collision', d3.forceCollide().radius(d => d.radius + 1));
      
        // force simulation starts up automatically, which we don't want as there aren't any nodes yet
        simulation.stop();
      
        // set up colour scale
        const fillColour = d3.scaleOrdinal()
          .domain(data.sort((a,b) => a.size - b.size).map(item => item.topic))
          .range(["#feebe2", "#fbb4b9", "#f768a1", "#c51b8a", "#7a0177"]);
      
        // data manipulation function takes raw data from csv and converts it into an array of node objects
        // each node will store data and visualisation values to draw a bubble
        // rawData is expected to be an array of data objects, read in d3.csv
        // function returns the new node array, with a node for each element in the rawData input
        function createNodes(rawData) {
          // use max size in the data as the max in the scale's domain
          // note we have to ensure that size is a number
          const maxSize = d3.max(rawData, d => +d.size);
      
          // size bubbles based on area
          const radiusScale = d3.scaleSqrt()
            .domain([0, maxSize])
            .range([0, 60])
      
          // use map() to convert raw data into node data
          const myNodes = rawData.map(d => ({
            ...d,
            radius: radiusScale(+d.size),
            size: +d.size,
            x: Math.random() * 900,
            y: Math.random() * 800
          }))
      
          return myNodes;
        }
      
        // main entry point to bubble chart, returned by parent closure
        // prepares rawData for visualisation and adds an svg element to the provided selector and starts the visualisation process
        let chart = function chart(selector, rawData) {
          // convert raw data into nodes data
          nodes = createNodes(rawData);
      
          // create svg element inside provided selector
          svg = d3.select(selector)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '500px')
      
          // bind nodes data to circle elements
          const elements = svg.selectAll('.bubble')
            .data(nodes, d => d.topic)
            .enter()
            .append('g')
            .on("click", (event, d) => handleSelection(year, d.topic))
            .on('dblclick', (event, d) => handleSelection())
      
          bubbles = elements
            .append('circle')
            .classed('bubble', true)
            .attr('r', d => d.radius)
            .style('fill', d => fillColour(d.topic))
      
          // labels
          labels = elements
            .append('text')
            .classed('topic-label', true)
            .attr('dy', '.3em')
            .style('text-anchor', 'middle')
            .style('font-size', '1em')
            .text(d => (d.topic.charAt(0).toUpperCase() + d.topic.slice(1)))
      
          // set simulation's nodes to our newly created nodes array
          // simulation starts running automatically once nodes are set
          simulation.nodes(nodes)
            .on('tick', ticked)
            .restart();
        }
      
        // callback function called after every tick of the force simulation
        // here we do the actual repositioning of the circles based on current x and y value of their bound node data
        // x and y values are modified by the force simulation
        function ticked() {
          bubbles
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
      
          labels
            .attr('x', d => d.x)
            .attr('y', d => d.y)
        }
      
        // return chart function from closure
        return chart;
      }
      
      // new bubble chart instance
      let myBubbleChart = bubbleChart();
      
      // function called once promise is resolved and data is loaded from csv
      // calls bubble chart function to display inside #vis div
      function display(data) {
        myBubbleChart(svgRef.current, data);
      }

      display(data)
      
    }
  }, [])

  useEffect(() => {
    d3.selectAll('.bubble')
      .attr('opacity', d => {
        if(selected.topic && d.topic !== selected.topic) return '0.3'
        else return '1'
      })
      .on('mouseover', (event, d) => {
        if(d.topic === selected.topic){
          console.log(d)
        }
      })
    d3.selectAll('.topic-label')
      .attr('fill-opacity', d => {
        if(selected.topic && d.topic !== selected.topic) return '0.3'
        else return '1'
      })
  }, [selected])
  
  return (
    <div ref={svgRef}> </div>
  )
}

export default ForceGraph