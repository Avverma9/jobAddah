"use client"
import React from 'react'

export default function LoginForm() {
  return (
    <form>
      <input placeholder="Email" />
      <input placeholder="Password" type="password" />
      <button type="submit">Login</button>
    </form>
  )
}
