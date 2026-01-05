import { useState } from 'react'

export default function useJobs() {
  const [jobs, setJobs] = useState([])

  return { jobs, setJobs }
}
