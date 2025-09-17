import React, { useEffect } from 'react'
import { use } from 'react'
import { useLocation, useNavigate, useRoutes } from 'react-router-dom'
import { useState } from 'react'
import base64 from 'base-64';

const MarkAttendance = () => {
    const {token} = Object.fromEntries(new URLSearchParams(window.location.search));
    const [data , setData] = useState(null);
    const navigate = useNavigate();
    // const base64 = require('base-64');
    const markAttendance = async () => {
        return await fetch((import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000') + '/api/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        })
    }

    useEffect(() => {

        console.log(token)
        const decode  = base64.decode(token)
        console.log(decode)
        setData(decode)

        const mark = async () => {
            const res = await markAttendance();
            console.log(res)
            if (res.ok){
                navigate('/scan');
            }
        }
        mark();
    },[]);
  return (
    <div>{data ?? <p>No attendance data available</p>}</div>
  )
}

export default MarkAttendance