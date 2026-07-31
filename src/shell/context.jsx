import { createContext, use, useMemo, useState } from 'react'
import { DEVICE_SIZES } from './constants.js'

const LS = {
  dark: 'driver-ai-dark-mode',
  rtl: 'driver-ai-rtl',
  device: 'driver-ai-device-size',
  land: 'driver-ai-landscape',
}

function readBool(key) {
  try {
    return localStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

function writeBool(key, v) {
  try {
    if (v) localStorage.setItem(key, 'true')
    else localStorage.removeItem(key)
  } catch {}
}

function readInt(key, fallback, max) {
  try {
    const n = parseInt(localStorage.getItem(key) ?? '', 10)
    return Number.isFinite(n) && n >= 0 && n < max ? n : fallback
  } catch {
    return fallback
  }
}

const Ctx = createContext({
  darkMode: false,
  setDarkMode: () => {},
  rtl: false,
  setRtl: () => {},
  deviceSizeIdx: 3,
  setDeviceSizeIdx: () => {},
  landscape: false,
  setLandscape: () => {},
})

export function DeviceFrameProvider({ children }) {
  const [darkMode, setDarkModeState] = useState(() => readBool(LS.dark))
  const [rtl, setRtlState] = useState(() => readBool(LS.rtl))
  const [deviceSizeIdx, setDeviceSizeIdxState] = useState(() =>
    readInt(LS.device, 3, DEVICE_SIZES.length),
  )
  const [landscape, setLandscapeState] = useState(() => readBool(LS.land))

  function setDarkMode(v) {
    writeBool(LS.dark, v)
    setDarkModeState(v)
  }
  function setRtl(v) {
    writeBool(LS.rtl, v)
    setRtlState(v)
  }
  function setDeviceSizeIdx(i) {
    try {
      localStorage.setItem(LS.device, String(i))
    } catch {}
    setDeviceSizeIdxState(i)
  }
  function setLandscape(v) {
    writeBool(LS.land, v)
    setLandscapeState(v)
  }

  const value = useMemo(
    () => ({
      darkMode,
      setDarkMode,
      rtl,
      setRtl,
      deviceSizeIdx,
      setDeviceSizeIdx,
      landscape,
      setLandscape,
    }),
    [darkMode, deviceSizeIdx, landscape, rtl],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useDeviceFrame = () => use(Ctx)
