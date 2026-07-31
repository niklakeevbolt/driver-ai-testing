import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DeviceFrameProvider } from '@shell'
import { DevToolsProvider } from './context/DevToolsContext.jsx'
import PasswordGate from './components/PasswordGate.jsx'
import './index.css'
import App from './App.jsx'

document.documentElement.dataset.mode = 'light'
document.documentElement.dataset.theme = 'driver'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PasswordGate>
      <DeviceFrameProvider>
        <DevToolsProvider>
          <App />
        </DevToolsProvider>
      </DeviceFrameProvider>
    </PasswordGate>
  </StrictMode>,
)
