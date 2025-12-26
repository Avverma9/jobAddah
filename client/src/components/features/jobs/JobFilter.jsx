"use client"
import React from 'react'

export default function JobFilter({ onChange }) {
  return (
    <div className="job-filter">
      <input placeholder="Search jobs" onChange={(e) => onChange?.(e.target.value)} />
    </div>
  )
}
