"use client"
import React from 'react'

export default function RegisterForm() {
  return (
    <form>
      <input placeholder="Name" />
      <input placeholder="Email" />
      <input placeholder="Password" type="password" />
      <button type="submit">Register</button>
    </form>
  )
}
