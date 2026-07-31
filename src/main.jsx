import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { DeviceFrameProvider } from '@shell'
import { DevToolsProvider } from './context/DevToolsContext.jsx'
import PasswordGate from './components/PasswordGate.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

document.documentElement.dataset.mode = 'light'
document.documentElement.dataset.theme = 'driver'

const App = lazy(() => import('./App.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <PasswordGate>
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
      </PasswordGate>
    </ErrorBoundary>
  </StrictMode>,
)
