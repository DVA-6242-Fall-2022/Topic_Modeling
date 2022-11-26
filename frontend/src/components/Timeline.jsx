import React from 'react'

function Timeline({data}) {
  return (
    <div className='grid grid-flow-row md:grid-flow-col place-items-center static md:absolute md:bottom-0 md:w-screen px-5 md:py-10 md:bg-yellow-200 opacity-50 md:opacity-100'>
      {Object.keys(data).map((year, idx) => (
        <div key={idx} className='text-lg'>
          {year}
        </div>
      ))}
    </div>
  )
}

export default Timeline