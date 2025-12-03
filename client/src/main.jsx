import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// SSG entrypoint for `vite-plugin-ssg`
export function createApp() {
  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
}

if (!import.meta.env.SSR) {
  const root = createRoot(document.getElementById('root'))
  root.render(createApp())
}
