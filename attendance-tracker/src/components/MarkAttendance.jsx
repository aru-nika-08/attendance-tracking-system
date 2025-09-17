import React, { useEffect } from 'react'
import { use } from 'react'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import { base64 } from 'base-64'

const MarkAttendance = () => {
    const {token} = useLocation().searchParams;
    const [data , setData] = useState(null);
    // const base64 = require('base-64');
    useEffect(() => {
        console.log(token)
        const decode  = base64.decode(token)
        console.log(decode)
    },[]);
  return (
    <div>{data ?? <p>No attendance data available</p>}</div>
  )
}

export default MarkAttendance