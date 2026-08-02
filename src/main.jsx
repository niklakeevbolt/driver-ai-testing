import { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { DeviceFrameProvider } from '@shell'
import { DevToolsProvider } from './context/DevToolsContext.jsx'
import { CountryProvider, useCountryOptional } from './context/CountryContext.jsx'
import PasswordGate from './components/PasswordGate.jsx'
import CountryPicker from './components/CountryPicker.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

document.documentElement.dataset.mode = 'light'
document.documentElement.dataset.theme = 'driver'

const App = lazy(() => import('./App.jsx'))

function Root() {
  const { country } = useCountryOptional() ?? {}

  if (!country) {
    return <CountryPicker />
  }

  return (
    <DeviceFrameProvider>
      <DevToolsProvider>
        <Suspense
          fallback={
            <div
              style={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                background: '#f0f2f5',
                color: '#191f1c',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              Loading prototype…
            </div>
          }
        >
          <App />
        </Suspense>
      </DevToolsProvider>
    </DeviceFrameProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <PasswordGate>
      <CountryProvider>
        <Root />
      </CountryProvider>
    </PasswordGate>
  </ErrorBoundary>,
)
