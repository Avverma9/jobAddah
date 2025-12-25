import React from 'react'
import JobCard from './JobCard'

export default function JobsList({ jobs = [] }) {
  return (
    <section>
      {jobs.map((j) => (
        <JobCard key={j.id} job={j} />
      ))}
    </section>
  )
}
