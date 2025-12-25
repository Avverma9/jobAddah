"use client"
import React from 'react'

export default function Button({ children, ...props }) {
  return (
    <button {...props} className={props.className || 'btn'}>
      {children}
    </button>
  )
}
