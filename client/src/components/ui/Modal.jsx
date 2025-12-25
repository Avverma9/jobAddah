"use client"
import React from 'react'

export default function Modal({ children, open, onClose }) {
  if (!open) return null
  return (
    <div className="modal">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">{children}</div>
    </div>
  )
}
