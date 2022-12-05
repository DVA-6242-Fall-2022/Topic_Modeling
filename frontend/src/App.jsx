import React, { useMemo, useState } from 'react'
import SingleGraph from './components/SingleGraph'
import { Link } from "react-router-dom";
import ReactTooltip from 'react-tooltip';
import ReactDOMServer from 'react-dom/server';
import subredditList from './subreddits.json'

const ToolTipInfo = () => {
  return (
    <div>
      <b>Usage:</b>
      <p style={{marginBottom: '8px'}}>Single click to select a node. Double click to unselect.</p>
      <b>Selecting a node will show the sentiments associated with that topic.</b>
      <br />
      <b>Links will connect a topic across time showing how the topic has changed.</b>
      <p style={{marginTop: '8px'}}>
        <b>You can also see the model outputs by visiting '<em>Interactive Infographics</em>'.</b>
      </p>
      <b>Model outputs give more techincal information about how the BERT <br /> model perceives topic modeling.</b>
    </div>
  )
}

function App() {
  const [selected, setSelected] = useState(false)
  const [subreddit, setSubreddit] = useState(subredditList.subreddits[0])
  const data = useMemo(() => {
    const temp = {}
    subredditList.subreddits.forEach((item, i) => {
      temp[item] = `./data/${item}/topics_sentiments_${item.toLowerCase()}.csv`
    })
    return temp
  }, [subredditList.subreddits])
  
  const handleSelection = (selectedNode) => {
    setSelected(selectedNode)
  }

  const handleSubredditChange = (e) => {
    setSubreddit(e.target.value)
  }

  return (
    <div className='h-full md:h-screen md:w-screen bg-yellow-100 flex md:block max-h-screen overflow-hidden'>
      <div className='p-4 flex flex-col items-stretch h-full w-full'>
        <h1 className='text-2xl font-bold text-center'>Glance: Topic Modeling over Time</h1>
        <div className='m-auto w-full text-center flex items-center justify-center mt-4 gap-8'>
          <h3 className='text-center justify-self-end font-medium'>Choose a subreddit</h3>
          <select 
            name="subreddit" 
            id="subreddit"
            className='w-1/5 border border-solid border-black rounded px-4 py-2 relative z-50'
            value={subreddit}
            onChange={handleSubredditChange}
          >
            {subredditList.subreddits.map((item, i) => (
              <option key={i} value={item}>{item}</option>
            ))}
          </select>
          <img 
            className='w-6 -m-4 opacity-60 cursor-pointer' 
            src='./info_icon.svg' 
            alt="Info" 
            data-html={true} 
            data-tip={ReactDOMServer.renderToString(ToolTipInfo())}
          />
        </div>
        <div className='m-auto text-center'>
          <Link to={{pathname: '/viz', search: `?subreddit=${subreddit}`}} className='relative z-50 text-blue-500 underline'>Interactive Infographics</Link>
        </div>
        <div className='m-auto w-screen items-end px-10 justify-self-end'>
          <SingleGraph data={data[subreddit]} selected={selected} handleSelection={handleSelection} />
        </div>
      </div>
      <ReactTooltip place='bottom' />
    </div>
  )
}

export default App