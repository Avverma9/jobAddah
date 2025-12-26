"use client"
import React from 'react'

export default function Input(props) {
  return <input {...props} className={props.className || 'input'} />
}
