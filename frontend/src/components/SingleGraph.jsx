import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import timeSentiments from '../topics_over_time_with_sentiment.csv'
import _ from 'lodash'
import tip from 'd3-tip'

// data manipulation function takes raw data from csv and converts it into an array of node objects
// each node will store data and visualisation values to draw a bubble
// rawData is expected to be an array of data objects, read in d3.csv
// function returns the new node array, with a node for each element in the rawData input
function createNodes(rawData, currentTimeline) {
  const timeStamps = Array.from(new Set(rawData.map(item => item.Timestamp)))
  const filterTimeline = timeStamps.slice(currentTimeline, currentTimeline+3)

  // use max size in the data as the max in the scale's domain
  // note we have to ensure that size is a number
  const maxSize = d3.max(rawData, d => +d.Frequency / 1.5);

  // size bubbles based on area
  const radiusScale = d3.scaleSqrt()
    .domain([0, maxSize])
    .range([0, 60])

  // use map() to convert raw data into node data
  const myNodes = rawData.map(d => ({
    ...d,
    Topic: +d.Topic,
    radius: radiusScale(+d.Frequency),
    comment_sentiment: +d.comment_sentiment,
    Frequency: +d.Frequency,
    // size: +d.size,
    x: Math.random() * 900,
    y: Math.random() * 800
  }))


  const timeGroups = _.groupBy(myNodes, 'Timestamp')

  Object.keys(timeGroups).forEach(key => {
    const temp = _.orderBy(timeGroups[key], 'Frequency', 'desc')
    timeGroups[key] = temp.slice(0, 20)
  })

  const topNodes = Object.values(timeGroups).reduce((prev, curr) => {
    return [
      ...prev,
      ...curr
    ]
  }, [])

  return topNodes.filter(item => filterTimeline.includes(item.Timestamp));
}

// bubbleChart creation function; instantiate new bubble chart given a DOM element to display it in and a dataset to visualise
function bubbleChart(selector, timeSentimentData, graphElements, setGraphElements, currentTimeline, handleSelection) {

  // create svg element
  const svg = d3.select(selector)
  .append('svg')
  .attr('id', 'graph-svg')
  .attr('width', '100%')
  .attr('height', '600px')

  const svgData = document.getElementById('graph-svg').getBoundingClientRect()

  // location to centre the bubbles
  const centre = { x: svgData.width/2, y: svgData.height/2 };

  // strength to apply to the position forces
  const forceStrength = 0.03;

  // these will be set in createNodes and chart functions
  // point scale for positioning
  const clusters = d3.scalePoint()
  .domain(_.range(currentTimeline, currentTimeline+3))
  .range([100, svgData.width-100])
  .padding(0.2)
  
  let bubbles = null;
  let labels = null;
  var nodes = [];

  // charge is dependent on size of the bubble, so bigger towards the middle
  function charge(d) {
    return Math.pow(d.radius, 2.0) * 0.01
  }

  // create a force simulation and add forces to it
  const simulation = d3.forceSimulation()
    .force('charge', d3.forceManyBody())
    .force('x', d3.forceX().x(centre.x))
    .force('y', d3.forceY().y(centre.y))
    .force('collision', d3.forceCollide().radius(d => d.radius + 2))
    // .force('center', d3.forceCenter(centre.x, centre.y))
    // .force("center", d3.forceCenter(svgData.width, 2*(svgData.height / 3)));

  // force simulation starts up automatically, which we don't want as there aren't any nodes yet
  simulation.stop();

  // set up colour scale
  const fillColour = d3.scaleLinear()
    .domain(d3.extent(timeSentimentData.map(item => item.Frequency)))
    .range(["#feebe2", "#fbb4b9", "#f768a1", "#c51b8a", "#7a0177"]);

  // main entry point to bubble chart, returned by parent closure
  // prepares rawData for visualisation and adds an svg element to the provided selector and starts the visualisation process
  
  const timeStamps = Array.from(new Set(timeSentimentData.map(item => item.Timestamp)))

  // convert raw data into nodes data
  nodes = createNodes(timeSentimentData, currentTimeline);

  const toolTip = tip().attr('class', 'd3-tip').html(function(event, d) { 
    return `
      <div>
        <h1>Topic No.: ${d.Topic}</h1>
        <h3>Words</h3>
        <ul>
          <li>${d.Words}</li>
        </ul>
        <h3>Sentiment: ${parseFloat(d.comment_sentiment).toFixed(2)}<h3>
      </div>
    `
  });
  svg.call(toolTip)

  const bubbleContainer = svg.append('g').classed('bubble-container', true).selectAll('.bubble')

  // bind nodes data to circle elements
  const elements = bubbleContainer
    .data(nodes, d => d.Topic)
    .enter()
    .append('g')
    .classed('bubble-group', true)
    .on("click", function(event, d){
      if(d3.select('.sentiment-grid').empty()) handleSelection(d)
    })
    .on('dblclick', function(event, d){
      handleSelection()
      d3.selectAll('.linked-paths').remove()
      d3.select('.axis-sentiment').remove()
      d3.select('.sentiment-grid').remove()
    })
    .on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide)

  bubbles = elements
    .append('circle')
    .classed('bubble', true)
    .attr('r', d => d.radius)
    .style('fill', d => fillColour(d.Frequency))

  // labels
  labels = elements
    .append('text')
    .classed('topic-label', true)
    .attr('dy', '.3em')
    .style('text-anchor', 'middle')
    .style('font-size', '1em')
    .text(d => d.Topic)

  // links
  const path = svg
  .append('g')
  .attr('id', 'paths')
  .selectAll(".paths")

  // set simulation's nodes to our newly created nodes array
  // simulation starts running automatically once nodes are set
  simulation.nodes(nodes)
    .on('tick', ticked)
    .restart();

  svg.append("g")
    .attr("transform", "translate(" + 0 + ", " + (600-20) + ")")
    .attr("class", "axis-timeline")
    .call(d3.axisBottom(clusters));
  
  d3.selectAll('.tick').selectAll('text')
    .style("font-size", "13px")
    .text(d => {
      return new Date(timeStamps[d]).toLocaleDateString('en-US', {month: 'long', year: 'numeric'})
    });
  
  const sentimentScale = d3.scaleLinear()
    .domain([1, -1])
    .range([100, svgData.height-100])
    // .padding(0.3)
    // .round(true)
  
  // callback function called after every tick of the force simulation
  // here we do the actual repositioning of the circles based on current x and y value of their bound node data
  // x and y values are modified by the force simulation
  function ticked() {
    const k = this.alpha() * 1;
    //move the nodes to their foci/cluster
    simulation.nodes().forEach(function(n, i) {
      n.x += (clusters(timeStamps.indexOf(n.Timestamp)) - n.x) * k;
      n.y += (300 - n.y) * k;
    });

    d3.selectAll('.bubble')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)

    d3.selectAll('.topic-label')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
  }

  setGraphElements({
    clusters, 
    simulation,
    path,
    timeStamps,
    sentimentScale,
    nodes,
    svgData,
    timeSentimentData
  })

  return Object.assign({node: svg.node()}, {
    update: (newNodes, selected)  => {
      // Make a shallow copy to protect against mutation, while
      // recycling old nodes to preserve position and velocity.
      // const old = new Map(elements.data().map(d => [d.Topic, d]));
      // nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
      // links = links.map(d => Object.assign({}, d));
      // console.log(elements.data(), newNodes)
      const old = _.intersectionWith(elements.data(), newNodes, (a, b) => {
        if(a.Topic === b.Topic && a.Timestamp === b.Timestamp) return true
        else return false
      })

      const temp = _.differenceWith(newNodes, old, (a, b) => {
        if(a.Topic === b.Topic && a.Timestamp === b.Timestamp) return true
        else return false
      })

      const remove = _.differenceWith(elements.data(), old, (a, b) => {
        if(a.Topic === b.Topic && a.Timestamp === b.Timestamp) return true
        else return false
      })

      const updatedNodes = [...old, ...temp]

      d3.selectAll('.bubble-group').remove()

      simulation.nodes(updatedNodes);
      simulation.alpha(1).restart();

      bubbleContainer
        .data(updatedNodes, d => d.Topic)
        .join(enter => {
            const newElements = enter.append('g')
            .classed('bubble-group', true)
            .on("click", function(event, d){
              if(d3.select('.sentiment-grid').empty()) handleSelection(d)
            })
            .on('dblclick', function(event, d){
              handleSelection()
              d3.selectAll('.linked-paths').remove()
              d3.select('.axis-sentiment').remove()
              d3.select('.sentiment-grid').remove()
            })
            .on('mouseover', toolTip.show)
            .on('mouseout', toolTip.hide)


            newElements.append('circle')
            .classed('bubble', true)
            .attr('r', d => d.radius)
            .style('fill', d => fillColour(d.Frequency))

            newElements.append('text')
            .classed('topic-label', true)
            .attr('dy', '.3em')
            .style('text-anchor', 'middle')
            .style('font-size', '1em')
            .text(d => d.Topic)
          },
          update => {
            console.log(update)
          },
          exit => {
            console.log(exit)
          })
      // newElements.join(enter => 
      //     enter.append('circle')
      //     .classed('bubble', true)
      //     .attr('r', d => d.radius)
      //     .style('fill', d => fillColour(d.Frequency))
      //   )

      // link = link
      //   .data(links, d => `${d.source.id}\t${d.target.id}`)
      //   .join("line");
    }
  });
}

function SingleGraph({selected, handleSelection}) {
  const svgRef = useRef()
  const dev = useRef(false)
  const [currentTimeline, setCurrentTimeline] = useState(0)
  const [graphElements, setGraphElements] = useState({})
  const [chartUpdate, setChartUpdate] = useState(null)

  useEffect(() => {
    if(!dev.current){
      dev.current = true

      d3.csv(timeSentiments).then(timeSentimentData => {
        const {update} = bubbleChart(svgRef.current, timeSentimentData, graphElements, setGraphElements, currentTimeline, handleSelection)
        setChartUpdate({update})
      })
      .catch(err => console.error(err))
    }
  }, [])

  useEffect(() => {
    if(selected && selected.Frequency){
      d3.selectAll('.bubble')
        .attr('visibility', d => {
          if(typeof selected.Topic === 'number' && d.Topic !== selected.Topic) return 'hidden'
          else return 'visible'
        })
      d3.selectAll('.topic-label')
        .attr('visibility', d => {
          if(typeof selected.Topic === 'number' && d.Topic !== selected.Topic) return 'hidden'
          else return 'visible'
      })

      const selectedTopicNodesIdx = graphElements.simulation.nodes().reduce((prev, curr , i) => {
        if (parseInt(curr.Topic) === selected.Topic) prev.push(i);
        return prev;
      }, []);

      const links = []
      selectedTopicNodesIdx.forEach((item, i) => {
        if(selectedTopicNodesIdx[i+1]){
          links.push({
            source: item,
            target: selectedTopicNodesIdx[i+1],
          })
        }
      })

      graphElements.simulation.force("link" , d3.forceLink(links).strength(0))

      graphElements.path
      .data(links.slice(currentTimeline, currentTimeline+2))
      .enter()
      .append("path")
      .classed('linked-paths', true)
      .attr("d", function(d) {
        var dx = d.target.x - d.source.x,
          dy = graphElements.sentimentScale(d.target.comment_sentiment) - graphElements.sentimentScale(d.source.comment_sentiment),
          dr = Math.sqrt(dx * dx + dy * dy);
        return "M" +
          d.source.x + "," +
          graphElements.sentimentScale(d.source.comment_sentiment) + "A" +
          dr + "," + dr + " 0 0,1 " +
          d.target.x + "," +
          graphElements.sentimentScale(d.target.comment_sentiment);
      });

      d3.select('#graph-svg').append("g")
      .attr("transform", "translate(" + 30 + ", " + 0 + ")")
      .attr("class", "axis-sentiment")
      .call(d3.axisLeft(graphElements.sentimentScale).ticks(2));

      d3.select('#graph-svg').insert("g",":first-child")
      .attr("class", "sentiment-grid")
      .attr("transform", "translate(30," + 0 + ")")
      .call(d3.axisLeft(graphElements.sentimentScale).tickSize(-graphElements.svgData.width + 100).tickFormat('').ticks(10))

      d3.selectAll('.bubble-group')
      .attr('transform', d => {
        if(d.Topic === selected.Topic) {
          return `translate(0, ${graphElements.sentimentScale(d.comment_sentiment) - d.y})`
        }
      })

    } else {
      d3.selectAll('.bubble-group')
      .attr('transform', 'translate(0, 0)')

      d3.selectAll('.bubble')
        .attr('visibility', 'visibile')

      d3.selectAll('.topic-label')
        .attr('visibility', 'visibile')
    }
  }, [selected])

  useEffect(() => {
    if(Object.keys(graphElements).length){
      graphElements.clusters.domain(_.range(currentTimeline, currentTimeline+3))
      const updatedAxis = d3.axisBottom(graphElements.clusters)
      d3.select('.axis-timeline').call(updatedAxis)
      d3.selectAll('.tick').selectAll('text')
      .style("font-size", "13px")
      .text(d => {
        return new Date(graphElements.timeStamps[d]).toLocaleDateString('en-US', {month: 'long', year: 'numeric'})
      });

      const updatedNodes = createNodes(graphElements.timeSentimentData, currentTimeline)
      chartUpdate.update(updatedNodes)
    }
  }, [currentTimeline])

  const handleTimelineChange = (action) => {
    if (action === 'prev'){
      if (currentTimeline === 0){
        alert('Cannot go back')
      } else setCurrentTimeline(prev => prev-1)
    } else {
      setCurrentTimeline(prev => prev+1)
    }
  }
  
  return (
    <div className='flex items-center w-full justify-evenly p-6'>
      <button 
        className={`bg-blue-200 border border-solid border-black border-opacity-50 rounded px-8 py-2 ${currentTimeline === 0 ? 'invisible' : 'visible'}`}
        onClick={() => handleTimelineChange('prev')}
      >
        Prev
      </button>
      <div className='w-full' ref={svgRef}></div>
      <button 
        className='bg-blue-200 border border-solid border-black border-opacity-50 rounded px-8 py-2'
        onClick={() => handleTimelineChange('next')}
      >
        Next
      </button>
    </div>
  )
}

export default SingleGraph