import React from 'react'
import ReactDOM from 'react-dom/client'
import { flushSync } from 'react-dom'
import App from './app/App'
import './styles/index.css'

// Commit the initial view before the render-blocking entry script completes,
// so a returning page's transition captures the content instead of an empty root.
flushSync(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
