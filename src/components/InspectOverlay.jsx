import { useState, useCallback } from 'react'
import { useDevTools } from '../context/DevToolsContext'

const TOKEN_MAP = {
  '#2a313c': '--color-content-primary',
  '#808c9f': '--color-content-secondary',
  '#ccd2dc': '--color-content-tertiary',
  '#1d965c': '--color-content-action-primary',
  '#32bb78': '--color-bg-action-primary',
  '#e0fff0': '--color-bg-action-secondary',
  '#ffffff': '--color-content-primary-inverted',
  '#000000': 'black',
  '#191f1c': '--color-content-primary',
}

function rgbToHex(rgb) {
  const m = rgb.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/i)
  if (!m) return ''
  return `#${[m[1], m[2], m[3]].map((n) => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`
}

function resolveColor(value) {
  if (!value || value === 'transparent') return null
  if (/^rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)$/i.test(value)) return null
  const hex = rgbToHex(value)
  if (!hex) return null
  return { hex, token: TOKEN_MAP[hex] ?? null }
}

function findComponent(el) {
  let node = el
  while (node && node !== document.body) {
    const slot = node.getAttribute('data-slot')
    if (slot) return slot
    node = node.parentElement
  }
  return null
}

const TYPE_MAP = {
  12: 'Body XS',
  13: 'Body XS+',
  14: 'Body S',
  15: 'Body S+',
  16: 'Body M',
  18: 'Body L',
  20: 'Heading XS',
  24: 'Heading S',
  32: 'Heading M',
}

function resolveTextStyle(fontSize) {
  const px = Math.round(parseFloat(fontSize))
  return TYPE_MAP[px] ?? null
}

export default function InspectOverlay() {
  const { inspectMode, setInspectData } = useDevTools()
  const [rect, setRect] = useState(null)

  const handleMouseMove = useCallback(
    (e) => {
      const overlay = e.currentTarget
      overlay.style.pointerEvents = 'none'
      const el = document.elementFromPoint(e.clientX, e.clientY)
      overlay.style.pointerEvents = 'auto'

      if (!el || el === overlay || el === document.body || el === document.documentElement) {
        setRect(null)
        setInspectData(null)
        return
      }

      const cs = getComputedStyle(el)
      const overlayRect = overlay.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()

      setRect({
        top: elRect.top - overlayRect.top,
        left: elRect.left - overlayRect.left,
        width: elRect.width,
        height: elRect.height,
      })

      const hasText = (el.textContent ?? '').trim().length > 0 && el.children.length === 0
      setInspectData({
        w: Math.round(elRect.width),
        h: Math.round(elRect.height),
        padding: [
          Math.round(parseFloat(cs.paddingTop)),
          Math.round(parseFloat(cs.paddingRight)),
          Math.round(parseFloat(cs.paddingBottom)),
          Math.round(parseFloat(cs.paddingLeft)),
        ],
        bg: resolveColor(cs.backgroundColor),
        color: resolveColor(cs.color),
        radius: cs.borderRadius !== '0px' ? cs.borderRadius : '',
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        textStyle: hasText ? resolveTextStyle(cs.fontSize) : null,
        component: findComponent(el),
        hasText,
        tag: el.tagName.toLowerCase(),
      })
    },
    [setInspectData],
  )

  const handleMouseLeave = useCallback(() => {
    setRect(null)
    setInspectData(null)
  }, [setInspectData])

  if (!inspectMode) return null

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'absolute', inset: 0, zIndex: 9999, pointerEvents: 'auto', cursor: 'crosshair' }}
    >
      {rect ? (
        <div
          style={{
            position: 'absolute',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            outline: '2px solid var(--color-bg-promo-primary)',
            background: 'rgba(91, 104, 246, 0.10)',
            pointerEvents: 'none',
            boxSizing: 'border-box',
          }}
        />
      ) : null}
    </div>
  )
}
