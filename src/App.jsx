import { useState, useRef, useCallback, useEffect } from 'react'
import { useDeviceFrame } from '@shell'
import HomeScreen from './screens/HomeScreen'
import SidebarScreen from './screens/SidebarScreen'
import BoltHubScreen from './screens/BoltHubScreen'
import NavigationScreen from './screens/NavigationScreen'
import PreferencesScreen from './screens/PreferencesScreen'
import EarningsScreen from './screens/EarningsScreen'
import RidesScreen from './screens/RidesScreen'
import SafetyScreen from './screens/SafetyScreen'
import SideMenu from './components/SideMenu'
import DevSidebar, { TopBar } from './components/DevSidebar'
import PhoneFrame from './components/PhoneFrame'
import InspectOverlay from './components/InspectOverlay'
import InspectPanel from './components/InspectPanel'
import './App.css'

const SCREENS = {
  home: HomeScreen,
  navigation: NavigationScreen,
  preferences: PreferencesScreen,
  earnings: EarningsScreen,
  rides: RidesScreen,
  safety: SafetyScreen,
}

const DARK_SCREENS = new Set(['navigation'])

const SIDEBAR_ORIGIN = '56px 68px'
const HUB_ORIGIN = '335px 68px'

/**
 * The device frame and dev sidebar are authoring tools, so they need a mouse as
 * well as room. Requiring a fine pointer keeps tablets on the fullscreen app
 * even though they are wider than the breakpoint.
 */
const DESKTOP_QUERY = '(min-width: 768px) and (pointer: fine)'

export default function App() {
  const { darkMode, rtl } = useDeviceFrame()
  const [screen, setScreen] = useState('home')
  const [, setHistory] = useState([])
  const [scenario, setScenario] = useState('none')
  const [menuOpen, setMenuOpen] = useState(false)
  // Survives HomeScreen remount when leaving Preferences.
  const [preferencesVisited, setPreferencesVisited] = useState(false)
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches)

  const hasTasks = scenario === 'tasks'
  const hasSupportMsg = scenario === 'support'
  const updatesBadge = hasTasks ? 2 : 1
  const helpBadge = hasSupportMsg ? 1 : 0
  const hubBadge = updatesBadge + helpBadge

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY)
    const handler = (event) => setIsDesktop(event.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.mode = darkMode ? 'dark' : 'light'
    document.documentElement.dataset.theme = 'driver'
  }, [darkMode])

  const [sidebarPhase, setSidebarPhase] = useState('closed')
  const [hubPhase, setHubPhase] = useState('closed')

  const closeTimer = useRef(null)
  const hubCloseTimer = useRef(null)
  const pendingNav = useRef(null)
  const fabRef = useRef(null)
  const hubFabRef = useRef(null)
  const phoneRef = useRef(null)

  const openSidebar = useCallback(() => {
    setSidebarPhase('init')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSidebarPhase('open')
      })
    })
  }, [])

  const closeSidebar = useCallback((onDone) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setSidebarPhase('exiting')
    closeTimer.current = setTimeout(() => {
      setSidebarPhase('closed')
      onDone?.()
    }, 310)
  }, [])

  const openHub = useCallback(() => {
    setHubPhase('init')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setHubPhase('open')
      })
    })
  }, [])

  const closeHub = useCallback((onDone) => {
    if (hubCloseTimer.current) clearTimeout(hubCloseTimer.current)
    setHubPhase('exiting')
    hubCloseTimer.current = setTimeout(() => {
      setHubPhase('closed')
      onDone?.()
    }, 310)
  }, [])

  const goToScreen = useCallback((to) => {
    if (sidebarPhase !== 'closed') closeSidebar()
    if (hubPhase !== 'closed') closeHub()
    setMenuOpen(false)
    setScreen(to)
  }, [sidebarPhase, hubPhase, closeSidebar, closeHub])

  const navigate = useCallback((to) => {
    if (to === 'sidebar' && sidebarPhase === 'closed' && hubPhase === 'closed') {
      openSidebar()
      return
    }
    if (to === 'bolt-hub' && hubPhase === 'closed' && sidebarPhase === 'closed') {
      openHub()
      return
    }
    if (sidebarPhase !== 'closed') {
      pendingNav.current = to
      closeSidebar(() => {
        const dest = pendingNav.current
        pendingNav.current = null
        if (dest && dest !== 'sidebar' && dest !== 'bolt-hub') {
          setHistory((history) => [...history, 'home'])
          setScreen(dest)
        }
      })
      return
    }
    setHistory((history) => [...history, screen])
    setScreen(to)
  }, [screen, sidebarPhase, hubPhase, openSidebar, closeSidebar, openHub])

  const goBack = useCallback(() => {
    if (sidebarPhase !== 'closed') { closeSidebar(); return }
    if (hubPhase !== 'closed') { closeHub(); return }
    if (screen === 'preferences') setPreferencesVisited(true)
    setHistory((history) => {
      const prev = history[history.length - 1] ?? 'home'
      setScreen(prev)
      return history.slice(0, -1)
    })
  }, [screen, sidebarPhase, hubPhase, closeSidebar, closeHub])

  const CurrentScreen = SCREENS[screen] ?? HomeScreen
  const isDark = DARK_SCREENS.has(screen)

  const sidebarStyle = (() => {
    const base = {
      position: 'absolute', inset: 0, zIndex: 100,
      transformOrigin: SIDEBAR_ORIGIN, overflow: 'hidden', willChange: 'transform',
    }
    if (sidebarPhase === 'init')    return { ...base, transform: 'scale(0.04)', borderRadius: 400, transition: 'none' }
    if (sidebarPhase === 'open')    return { ...base, transform: 'scale(1)', borderRadius: 0, transition: 'transform 0.38s cubic-bezier(0.34,1.56,0.64,1), border-radius 0.32s ease-out' }
    if (sidebarPhase === 'exiting') return { ...base, transform: 'scale(0.04)', borderRadius: 400, transition: 'transform 0.26s cubic-bezier(0.4,0,1,1), border-radius 0.22s ease-in' }
    return base
  })()

  const hubStyle = (() => {
    const base = {
      position: 'absolute', inset: 0, zIndex: 100,
      transformOrigin: HUB_ORIGIN, overflow: 'hidden', willChange: 'transform',
    }
    if (hubPhase === 'init')    return { ...base, transform: 'scale(0.04)', borderRadius: 400, transition: 'none' }
    if (hubPhase === 'open')    return { ...base, transform: 'scale(1)', borderRadius: 0, transition: 'transform 0.38s cubic-bezier(0.34,1.56,0.64,1), border-radius 0.32s ease-out' }
    if (hubPhase === 'exiting') return { ...base, transform: 'scale(0.04)', borderRadius: 400, transition: 'transform 0.26s cubic-bezier(0.4,0,1,1), border-radius 0.22s ease-in' }
    return base
  })()

  const screenProps = {
    navigate,
    goBack,
    sidebarPhase,
    fabRef,
    hubFabRef,
    isHubOpen: hubPhase !== 'closed',
    hasTasks,
    hubBadge,
    preferencesVisited,
    onOpenMenu: () => setMenuOpen(true),
  }

  const phoneContent = (
    <>
      <CurrentScreen {...screenProps} />

      {sidebarPhase !== 'closed' ? (
        <div style={sidebarStyle}>
          <SidebarScreen navigate={navigate} goBack={goBack} />
        </div>
      ) : null}

      {hubPhase !== 'closed' ? (
        <div style={hubStyle}>
          <BoltHubScreen
            goBack={goBack}
            hasTasks={hasTasks}
            hasSupportMsg={hasSupportMsg}
            updatesBadge={updatesBadge}
          />
        </div>
      ) : null}

      <SideMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={goToScreen}
      />

      <InspectOverlay />

      <div className={`home-indicator ${isDark ? 'dark' : 'light'}`} />
    </>
  )

  const sidebarProps = {
    currentScreen: screen,
    onNavigate: goToScreen,
    scenario,
    onScenarioChange: setScenario,
  }

  const fullscreen = new URLSearchParams(window.location.search).has('fullscreen')

  if (fullscreen || !isDesktop) {
    return (
      <div
        className="app-fullscreen"
        ref={phoneRef}
        dir={rtl ? 'rtl' : 'ltr'}
        data-mode={darkMode ? 'dark' : 'light'}
      >
        {phoneContent}
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', width: '100%', background: 'var(--color-layer-floor-0-grouped, #f0f2f5)', display: 'flex' }}>
      <DevSidebar {...sidebarProps} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
            <PhoneFrame>
              <div
                className="phone-screen-inner"
                ref={phoneRef}
                dir={rtl ? 'rtl' : 'ltr'}
                data-mode={darkMode ? 'dark' : 'light'}
                style={{ width: '100%', height: '100%', position: 'relative' }}
              >
                {phoneContent}
              </div>
            </PhoneFrame>
            <InspectPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
