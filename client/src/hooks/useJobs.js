import { useState, useEffect } from 'react'

export default function useJobs() {
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    // placeholder: fetch jobs
    setJobs([])
  }, [])

  return { jobs, setJobs }
}
