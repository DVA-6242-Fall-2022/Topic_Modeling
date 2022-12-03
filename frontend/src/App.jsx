import React, { useState } from 'react'
import SingleGraph from './components/SingleGraph'
import { Link } from "react-router-dom";
import timeSentimentsNews from './data/topics_sentiments_news.csv'
import timeSentimentsPolitics from './data/topics_sentiments_politics.csv'

function App() {
  const [selected, setSelected] = useState(false)
  const [subreddit, setSubreddit] = useState('news')

  const handleSelection = (selectedNode) => {
    setSelected(selectedNode)
  }

  const handleSubredditChange = (e) => {
    setSubreddit(e.target.value)
  }

  const getData = {
    news: timeSentimentsNews,
    politics: timeSentimentsPolitics
  }

  return (
    <div className='h-full md:h-screen md:w-screen bg-yellow-100 flex md:block max-h-screen overflow-hidden'>
      <div className='p-4'>
        <h1 className='text-2xl font-bold text-center'>Topic Modeling over Time</h1>
        <div className='m-auto w-full text-center flex items-center justify-center mt-4 gap-8'>
          <h3 className='text-center justify-self-end font-medium'>Choose a subreddit</h3>
          <select 
            name="subreddit" 
            id="subreddit"
            className='w-1/5 border border-solid border-black rounded px-4 py-2 relative z-50'
            value={subreddit}
            onChange={handleSubredditChange}
          >
            <option value="news">News</option>
            {/* <option value="movies">Movies</option> */}
            <option value="politics">Politics</option>
          </select>
        </div>
        <div className='m-auto text-center'>
          <Link to={{pathname: '/viz', search: `?subreddit=${subreddit}`}} className='relative z-50 text-blue-500 underline top-10'>Interactive Infographics</Link>
        </div>
        <div className='grid grid-flow-row md:grid-flow-col w-screen items-end my-10 px-10'>
          <SingleGraph data={getData[subreddit]} selected={selected} handleSelection={handleSelection} />
        </div>
      </div>
    </div>
  )
}

export default App