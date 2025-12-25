"use client"
import React from 'react'

export default function ApplyButton({ onClick }) {
  return (
    <button className="apply-btn" onClick={onClick}>
      Apply
    </button>
  )
}
