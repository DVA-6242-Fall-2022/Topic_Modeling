import React from 'react'

function Graph({year, data, handleSelection}) {

  return (
    <svg height={500} width={500}>
      <g>
        {Object.keys(data).map((topic, idx) => (
          <g key={idx} onClick={() => handleSelection(year, topic)}>
            <circle 
              r={10 + 3 * data[topic].weight} 
              cx={'50%'} 
              cy="50%" 
              transform={`translate(${idx* (10 + 3 * data[topic].weight)}, ${idx* (10 + 3 * data[topic].weight)})`}
            >
            </circle>
            <text 
              x='50%' 
              y='51%' 
              textAnchor='middle'
              transform={`translate(${idx* (10 + 3 * data[topic].weight)}, ${idx* (10 + 3 * data[topic].weight)})`}
            >
              {topic.charAt(0).toUpperCase() + topic.slice(1)}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}

export default Graph