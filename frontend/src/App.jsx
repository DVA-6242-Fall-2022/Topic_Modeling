import React, { useState } from 'react'
import ForceGraph from './components/ForceGraph'
import Graph from './components/Graph'
import MultiFociGraph from './components/MultiFociGraph'
import SingleGraph from './components/SingleGraph'
import Timeline from './components/Timeline'

function App() {
  const [selected, setSelected] = useState(false)

  const handleSelection = (selectedNode) => {
    setSelected(selectedNode)
  }

  return (
    <div className='h-full md:h-screen md:w-screen bg-yellow-100 flex md:block max-h-screen overflow-hidden'>
      <div className='p-4'>
        <h1 className='text-2xl font-bold text-center'>Topic Modeling over Time</h1>
        <div className='m-auto w-full text-center flex items-center justify-center mt-4 gap-8'>
          <h3 className='text-center justify-self-end font-medium'>Choose a subreddit</h3>
          <select name="subreddit" id="subreddit" className='w-1/5 border border-solid border-black rounded px-4 py-2 relative z-50'>
            <option value="news">News</option>
            <option value="sports">Movies</option>
            <option value="Politics">Politics</option>
          </select>
        </div>
        <div className='grid grid-flow-row md:grid-flow-col w-screen items-end my-auto md:h-screen md:relative bottom-32'>
          {/* {Object.keys(data).map((year, idx) => {
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
          })} */}
          <SingleGraph selected={selected} handleSelection={handleSelection} />
        </div>
      </div>
      {/* <Timeline data={data}/> */}
    </div>
  )
}

export default App