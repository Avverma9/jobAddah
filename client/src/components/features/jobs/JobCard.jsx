import React from 'react'

export default function JobCard({ job }) {
  return (
    <article className="job-card">
      <h3>{job?.title || 'Job title'}</h3>
      <p>{job?.company || 'Company'}</p>
    </article>
  )
}
