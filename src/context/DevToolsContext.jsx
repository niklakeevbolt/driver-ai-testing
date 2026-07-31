import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const DevToolsContext = createContext({
  inspectMode: false,
  setInspectMode: () => {},
  inspectData: null,
  setInspectData: () => {},
})

export function DevToolsProvider({ children }) {
  const [inspectMode, setInspectModeState] = useState(false)
  const [inspectData, setInspectData] = useState(null)

  const setInspectMode = useCallback((value) => {
    setInspectModeState(value)
    if (!value) setInspectData(null)
  }, [])

  const value = useMemo(
    () => ({
      inspectMode,
      setInspectMode,
      inspectData,
      setInspectData,
    }),
    [inspectData, inspectMode, setInspectMode],
  )

  return <DevToolsContext.Provider value={value}>{children}</DevToolsContext.Provider>
}

export const useDevTools = () => useContext(DevToolsContext)
