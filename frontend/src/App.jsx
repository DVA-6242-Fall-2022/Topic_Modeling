import React, { useState } from 'react'
import ForceGraph from './components/ForceGraph'
import Graph from './components/Graph'
import Timeline from './components/Timeline'
import data from './data.json'

function App() {
  const [selected, setSelected] = useState(false)

  const handleSelection = (year, topic) => {
    setSelected({year, topic})
  }

  return (
    <div className='h-full md:h-screen md:w-screen bg-yellow-100 flex md:block'>
      <div className='grid grid-flow-row md:grid-flow-col w-screen items-end my-auto md:h-screen md:relative bottom-32'>
        {Object.keys(data).map((year, idx) => {
          const yearData = []
          Object.keys(data[year]).forEach(key => {
            yearData.push({topic: key, size: data[year][key]['weight']})
          })
          return (
            // <Graph key={idx} year={year} data={data[year]} handleSelection={handleSelection}/>
            <ForceGraph 
              key={idx} 
              year={year} 
              data={yearData} 
              selected={selected} 
              handleSelection={handleSelection} 
            />
          )
        })}
      </div>
      <Timeline data={data}/>
    </div>
  )
}

export default App