import React from 'react'
import { Link, useLocation } from "react-router-dom";

function Viz() {
  const location = new useLocation()
  const subreddit = location.search.split('=')[1]
  const suf = `./data/${subreddit.charAt(0).toUpperCase() + subreddit.slice(1)}/${subreddit}`
  
  return (
    <div className='m-auto'>
      <div className='my-10 text-center'>
        <Link to={'/'} className='relative z-50 text-blue-500 underline py-10'>Go Back</Link>
      </div>
      <div className='grid grid-cols-2 justify-items-stretch'>
        <iframe style={{height: '600px'}} src={`${suf}_comments_sentiments.html`} title='sentiments'></iframe>
        <iframe style={{height: '700px'}} src={`${suf}_intertopic_distance.html`} title='intertopic'></iframe>
      </div>
      <div className='grid grid-cols-1 justify-items-stretch items-center m-auto'>
        <iframe className='w-5/6 m-auto overflow-hidden' style={{height: '500px'}} src={`${suf}_topics_over_time.html`} title='topics-over-time'></iframe>
        <iframe className='w-4/6 m-auto' style={{height: '1300px'}} src={`${suf}_word_freq.html`} title='word-frequency'></iframe>
      </div>
    </div>
  )
}

export default Viz