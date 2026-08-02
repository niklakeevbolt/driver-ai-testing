import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import { ChevronRight, Clear, Hide } from '@icons'
import { useCountry } from '../context/CountryContext.jsx'
import imgCalendar from '../assets/earnings/calendar-clock.png'
import imgBankCard from '../assets/earnings/bank-card.png'
import imgDiamond from '../assets/earnings/rewards-diamond.svg'
import imgRouteDot from '../assets/earnings/route-dot.svg'
import imgRouteStart from '../assets/earnings/route-marker-start.svg'
import imgRouteLine from '../assets/earnings/route-line.svg'
import imgRouteEnd from '../assets/earnings/route-marker-end.svg'
import {
  REWARDS_NEXT_TIER,
  REWARDS_PROGRESS,
  REWARDS_PROGRESS_FILL_RATIO,
} from '../data/rewards.js'
import { yesterdayStamp } from '../data/dates.js'

const FF = { fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)' }
const ELEV2 = '0px 4px 12px rgba(0,0,0,0.2)'
const NEUT  = 'rgba(0,45,30,0.07)'

// Rewards progress, from Figma node 1873:43311. Two rectangles rather than an
// exported asset so the fill keeps its 4px cap at any card width. Points, next
// tier and fill ratio come from the same source as Profile → Rewards.
const PROGRESS_TRACK = '#e1e5ea'
const PROGRESS_FILL  = '#191f1c'

// geometry — horizontal inset is fixed; card width tracks the phone screen so
// left and right margins stay equal on any device width.
const TOP = 44
const CL  = 24
const PW  = 113, PH = 48
const PAD = 16
const MAIN_H_FULL = 206      // header + weekly/balance tiles + bottom pad (no weekly goal)
const MAIN_H_COMPACT = 82    // when any sub-card is expanded (amount + Today only)
const CH = MAIN_H_FULL
const LR_H_COL = 78,  LR_H_EXP = 228
const BR_H_COL = 86,  BR_H_EXP = 198

function useHostWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(375)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const host = node.offsetParent || node.parentElement
    if (!host) return undefined
    const update = () => setWidth(host.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(host)
    return () => observer.disconnect()
  })

  return [ref, width]
}

const SPRING  = 'left 0.3s cubic-bezier(0.34,1.08,0.64,1), width 0.3s cubic-bezier(0.34,1.08,0.64,1), height 0.3s cubic-bezier(0.34,1.08,0.64,1)'
const EASE_IN = 'left 0.22s cubic-bezier(0.4,0,1,1), width 0.22s cubic-bezier(0.4,0,1,1), height 0.22s cubic-bezier(0.4,0,1,1)'
const SP = '0.3s cubic-bezier(0.34,1.08,0.64,1)'  // sub-card spring shorthand

function EyeOffIcon() {
  return <Hide size="lg" />
}

function ChevronIcon() {
  return <ChevronRight size="xs" />
}

function XIcon() {
  return <Clear size="lg" />
}

// phase: 'closed' | 'init' | 'open' | 'exiting'
// subCard: null | 'lastRide' | 'boltRewards'
export default function EarningsIsland({ onOpenChange }) {
  const country = useCountry()
  const [phase, setPhase]         = useState('closed')
  const [showCards, setShowCards] = useState(false)
  const [subCard, setSubCard]     = useState(null)
  const closeTimer = useRef(null)
  const cardsTimer = useRef(null)
  const [hostRef, screenW] = useHostWidth()
  const CW = Math.max(0, screenW - CL * 2)
  const PL = Math.round((screenW - PW) / 2)
  const innerW = Math.max(0, CW - PAD * 2)

  useEffect(() => () => {
    clearTimeout(closeTimer.current)
    clearTimeout(cardsTimer.current)
  }, [])

  const open = useCallback(() => {
    if (phase !== 'closed') return
    setPhase('init')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase('open')
        cardsTimer.current = setTimeout(() => setShowCards(true), 40)
      })
    })
    onOpenChange?.(true)
  }, [phase, onOpenChange])

  const close = useCallback(() => {
    if (phase === 'closed' || phase === 'exiting') return
    clearTimeout(cardsTimer.current)
    setShowCards(false)
    setSubCard(null)
    setPhase('exiting')
    onOpenChange?.(false)
    closeTimer.current = setTimeout(() => setPhase('closed'), 260)
  }, [phase, onOpenChange])

  const toggleSubCard = useCallback((card) => {
    setSubCard(prev => prev === card ? prev : card)
  }, [])

  // ── Closed: just the pill ───────────────────────────────────────
  if (phase === 'closed') {
    return (
      <button
        ref={hostRef}
        onClick={open}
        style={{
          position: 'absolute', top: TOP, left: PL,
          width: PW, height: PH, borderRadius: 28,
          background: '#fff', boxShadow: ELEV2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 15,
        }}
      >
        <span style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#2a313c', letterSpacing: '-0.34px', lineHeight: '25px' }}>
          {country.money.amount(country.earnings.today)}
        </span>
      </button>
    )
  }

  const isOpen  = phase === 'open'
  const showSub = showCards && isOpen

  // main card morph — collapses to 82px when any sub-card is expanded
  const mainH  = subCard !== null ? MAIN_H_COMPACT : MAIN_H_FULL
  const left   = isOpen ? CL : PL
  const width  = isOpen ? CW : PW
  const height = isOpen ? mainH : PH
  const trans  = phase === 'init' ? 'none' : isOpen ? SPRING : EASE_IN

  // secondary card positions flow from mainH
  const lrTop      = TOP + mainH + 8
  const lrH        = subCard === 'lastRide'    ? LR_H_EXP : LR_H_COL
  const boltTop    = lrTop + lrH + 8
  const brH        = subCard === 'boltRewards' ? BR_H_EXP : BR_H_COL
  const dismissTop = boltTop + brH + 8

  const lrExpanded = subCard === 'lastRide'
  const brExpanded = subCard === 'boltRewards'

  return (
    <>
      {/* ── Scrim ────────────────────────────────────────────── */}
      <div
        onClick={close}
        style={{
          position: 'absolute', inset: 0, zIndex: 28,
          background: 'rgba(0,0,0,0.18)',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.2s ease-out',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      />

      {/* ── Morphing main card ───────────────────────────────── */}
      <div
        ref={hostRef}
        onClick={subCard !== null ? () => setSubCard(null) : undefined}
        style={{
          position: 'absolute', top: TOP, left, width, height,
          borderRadius: 28, overflow: 'hidden',
          background: '#fff', boxShadow: ELEV2, zIndex: 30,
          transition: trans,
          cursor: subCard !== null ? 'pointer' : 'default',
        }}
      >
        <div
          onClick={open}
          style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: isOpen ? 0 : 1,
            transition: isOpen ? 'opacity 0.1s ease-out' : 'none',
            pointerEvents: isOpen ? 'none' : 'auto',
          }}
        >
          <span style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#2a313c', letterSpacing: '-0.34px', lineHeight: '25px' }}>
            {country.money.amount(country.earnings.today)}
          </span>
        </div>

        <div style={{
          position: 'absolute', top: 0, left: 0, width: CW, height: CH,
          opacity: isOpen ? 1 : 0,
          transition: isOpen ? 'opacity 0.18s ease-out 0.08s' : 'opacity 0.08s ease-in',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}>
          <button style={{
            position: 'absolute', top: 16, left: 16,
            width: 48, height: 48, borderRadius: 9600,
            background: NEUT,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#191f1c',
          }}>
            <EyeOffIcon />
          </button>
          <p style={{
            position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
            width: 184, textAlign: 'center',
            ...FF, fontSize: 28, fontWeight: 600, color: '#2a313c',
            letterSpacing: '-0.616px', lineHeight: '36px',
          }}>
            {country.money.amount(country.earnings.today)}
          </p>
          <p style={{
            position: 'absolute', top: 58, left: '50%', transform: 'translate(-50%, -50%)',
            width: 182, textAlign: 'center',
            ...FF, fontSize: 16, fontWeight: 400, color: '#2a313c',
            letterSpacing: '-0.176px', lineHeight: '24px',
          }}>
            Today
          </p>
          <div style={{ position: 'absolute', top: 82, left: PAD, width: innerW, display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, height: 108, background: NEUT, borderRadius: 16, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ width: 40, height: 35, flexShrink: 0, overflow: 'hidden' }}>
                <img src={imgCalendar} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'flex-end' }}>
                <p style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#2a313c', letterSpacing: '-0.34px', lineHeight: '25px' }}>{country.money.amount(country.earnings.weekly)}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ ...FF, fontSize: 16, fontWeight: 400, color: '#191f1c', letterSpacing: '-0.176px', lineHeight: '24px' }}>Weekly</span>
                  <ChevronIcon />
                </div>
              </div>
            </div>
            <div style={{ flex: 1, height: 108, background: NEUT, borderRadius: 16, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'flex-end' }}>
              <div style={{ width: 40, height: 29, flexShrink: 0, overflow: 'hidden' }}>
                <img src={imgBankCard} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <p style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#2a313c', letterSpacing: '-0.34px', lineHeight: '25px' }}>{country.money.amount(country.earnings.balance)}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ ...FF, fontSize: 16, fontWeight: 400, color: '#191f1c', letterSpacing: '-0.176px', lineHeight: '24px' }}>Balance</span>
                  <ChevronIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Last Ride card ───────────────────────────────────── */}
      <div
        onClick={() => showSub && toggleSubCard('lastRide')}
        style={{
          position: 'absolute', top: lrTop, left: CL, width: CW,
          height: lrH,
          borderRadius: 28, background: '#fff', boxShadow: ELEV2,
          overflow: 'hidden', zIndex: 30, cursor: 'pointer',
          opacity: showSub ? 1 : 0,
          transform: showSub ? 'translateY(0)' : 'translateY(20px)',
          transition: showSub
            ? `top ${SP}, height ${SP}, opacity 0.22s ease-out 0.04s, transform 0.22s ease-out 0.04s`
            : `top ${SP}, height ${SP}, opacity 0.15s ease-in, transform 0.15s ease-in`,
          pointerEvents: showSub ? 'auto' : 'none',
        }}
      >
        {/* Amount row — always at top: 12 */}
        <div style={{
          position: 'absolute', top: 12, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <span style={{ ...FF, fontSize: 24, fontWeight: 600, color: '#2a313c', letterSpacing: '-0.48px', lineHeight: '30px' }}>
            {country.money.spaced(country.earnings.lastRideFare)} •
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ ...FF, fontSize: 24, fontWeight: 600, color: '#2a313c', letterSpacing: '-0.48px', lineHeight: '30px' }}>{country.earnings.lastRidePoints}</span>
            <img src={imgDiamond} alt="" style={{ width: 16, height: 16, display: 'block' }} />
          </div>
        </div>

        {/* Date label — center at y=54 */}
        <p style={{
          position: 'absolute', top: 54, left: '50%', transform: 'translate(-50%, -50%)',
          width: 208, textAlign: 'center',
          ...FF, fontSize: 16, fontWeight: 400, color: 'rgba(0,10,7,0.63)',
          letterSpacing: '-0.176px', lineHeight: '24px',
        }}>
          Last ride • {yesterdayStamp()}
        </p>

        {/* Expanded detail — fades in as height grows past 78px */}
        <div style={{
          position: 'absolute', top: 78, left: 0, right: 0, bottom: 0,
          opacity: lrExpanded ? 1 : 0,
          transition: lrExpanded ? 'opacity 0.2s ease-out 0.15s' : 'opacity 0.1s ease-in',
          pointerEvents: lrExpanded ? 'auto' : 'none',
        }}>
          {/* Separator */}
          <div style={{ position: 'absolute', top: 0, left: 12, right: 12, height: 1, background: 'rgba(73,93,122,0.08)' }} />

          {/* Route — left:20, top:96 in card → top:18 inside this div */}
          <div style={{ position: 'absolute', top: 18, left: 20, right: 12, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {/* Route markers column */}
            <div style={{ width: 12, height: 56, position: 'relative', flexShrink: 0 }}>
              <div style={{
                position: 'absolute', top: 6, left: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: 44,
              }}>
                <div style={{ position: 'relative', width: 12, height: 12, flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: 3, width: 6, height: 6 }}>
                    <img src={imgRouteDot} alt="" style={{ width: '100%', height: '100%' }} />
                  </div>
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 12, height: 12 }}>
                    <img src={imgRouteStart} alt="" style={{ width: '100%', height: '100%' }} />
                  </div>
                </div>
                <div style={{ flex: 1, minHeight: 1, position: 'relative', width: 0 }}>
                  <div style={{ position: 'absolute', top: '-7.14%', bottom: '-7.14%', left: -1, right: -1 }}>
                    <img src={imgRouteLine} alt="" style={{ display: 'block', width: '100%', height: '100%' }} />
                  </div>
                </div>
                <div style={{ position: 'relative', width: 12, height: 12, flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: 3, width: 6, height: 6 }}>
                    <img src={imgRouteDot} alt="" style={{ width: '100%', height: '100%' }} />
                  </div>
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 12, height: 12 }}>
                    <img src={imgRouteEnd} alt="" style={{ width: '100%', height: '100%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                <p style={{ flex: 1, ...FF, fontSize: 16, fontWeight: 400, color: '#2a313c', letterSpacing: '-0.176px', lineHeight: '24px' }}>
                  {country.lastRide.from}
                </p>
                <p style={{ width: 48, textAlign: 'right', paddingTop: 2, ...FF, fontSize: 14, fontWeight: 400, color: '#808c9f', letterSpacing: '-0.084px', lineHeight: '20px', flexShrink: 0 }}>
                  11:05
                </p>
              </div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                <p style={{ flex: 1, ...FF, fontSize: 16, fontWeight: 400, color: '#2a313c', letterSpacing: '-0.176px', lineHeight: '24px' }}>
                  {country.lastRide.to}
                </p>
                <p style={{ width: 48, textAlign: 'right', paddingTop: 2, ...FF, fontSize: 14, fontWeight: 400, color: '#808c9f', letterSpacing: '-0.084px', lineHeight: '20px', flexShrink: 0 }}>
                  11:23
                </p>
              </div>
            </div>
          </div>

          {/* Buttons — top:168 in card → top:90 inside this div */}
          <div style={{ position: 'absolute', top: 90, left: 12, right: 12, display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, height: 48, borderRadius: 9600, background: NEUT, ...FF, fontSize: 16, fontWeight: 600, color: '#191f1c', letterSpacing: '-0.176px' }}>
              Ride details
            </button>
            <button style={{ flex: 1, height: 48, borderRadius: 9600, background: NEUT, ...FF, fontSize: 16, fontWeight: 600, color: '#191f1c', letterSpacing: '-0.176px' }}>
              All rides
            </button>
          </div>
        </div>
      </div>

      {/* ── Bolt Rewards card ────────────────────────────────── */}
      <div
        onClick={() => showSub && toggleSubCard('boltRewards')}
        style={{
          position: 'absolute', top: boltTop, left: CL, width: CW,
          height: brH,
          borderRadius: 28, background: '#fff', boxShadow: ELEV2,
          overflow: 'hidden', zIndex: 30, cursor: 'pointer',
          opacity: showSub ? 1 : 0,
          transform: showSub ? 'translateY(0)' : 'translateY(20px)',
          transition: showSub
            ? `top ${SP}, height ${SP}, opacity 0.22s ease-out 0.08s, transform 0.22s ease-out 0.08s`
            : `top ${SP}, height ${SP}, opacity 0.15s ease-in, transform 0.15s ease-in`,
          pointerEvents: showSub ? 'auto' : 'none',
        }}
      >
        {/* Icon + number + label — always at top: 12 */}
        <div style={{
          position: 'absolute', top: 12, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <img src={imgDiamond} alt="" style={{ width: 20, height: 20, display: 'block' }} />
            <span style={{ ...FF, fontSize: 24, fontWeight: 600, color: '#2a313c', letterSpacing: '-0.48px', lineHeight: '30px' }}>{REWARDS_PROGRESS.points}</span>
          </div>
          <p style={{ ...FF, fontSize: 16, fontWeight: 400, color: '#191f1c', letterSpacing: '-0.176px', lineHeight: '24px' }}>
            Bolt Rewards
          </p>
        </div>

        {/* Progress bar — always at top:78, flush with the card edges */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 8,
          top: 78, background: PROGRESS_TRACK,
        }}>
          <div style={{
            width: `${REWARDS_PROGRESS_FILL_RATIO * 100}%`, height: '100%',
            background: PROGRESS_FILL, borderRadius: '0 4px 4px 0',
          }} />
        </div>

        {/* Expanded detail — fades in as height grows past 86px */}
        <div style={{
          position: 'absolute', top: 90, left: 0, right: 0, bottom: 0,
          opacity: brExpanded ? 1 : 0,
          transition: brExpanded ? 'opacity 0.2s ease-out 0.15s' : 'opacity 0.1s ease-in',
          pointerEvents: brExpanded ? 'auto' : 'none',
        }}>
          {/* "Earn more" text — top:98 in card → top:8 inside this div */}
          <p style={{
            position: 'absolute', top: 8, left: PAD, right: PAD,
            ...FF, fontSize: 16, fontWeight: 400, color: 'rgba(0,10,7,0.63)',
            letterSpacing: '-0.176px', lineHeight: '24px',
          }}>
            {REWARDS_NEXT_TIER
              ? `Earn ${REWARDS_NEXT_TIER.pointsAway} more points to achieve ${REWARDS_NEXT_TIER.name}`
              : 'You have reached the top tier'}
          </p>

          {/* "Open Bolt Rewards" button — top:138 in card → top:48 inside this div */}
          <button style={{
            position: 'absolute', top: 48, left: PAD, right: PAD,
            height: 48, borderRadius: 9600,
            background: NEUT,
            ...FF, fontSize: 16, fontWeight: 600, color: '#191f1c', letterSpacing: '-0.176px',
          }}>
            Open Bolt Rewards
          </button>
        </div>
      </div>

      {/* ── Dismiss button ───────────────────────────────────── */}
      <button
        onClick={close}
        style={{
          position: 'absolute', top: dismissTop,
          left: '50%',
          transform: showSub ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(12px)',
          width: 56, height: 56, borderRadius: 9600,
          background: '#fff', boxShadow: ELEV2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#191f1c', zIndex: 30,
          opacity: showSub ? 1 : 0,
          transition: showSub
            ? `top ${SP}, opacity 0.2s ease-out 0.08s, transform 0.2s ease-out 0.08s`
            : `top ${SP}, opacity 0.15s ease-in, transform 0.15s ease-in`,
          pointerEvents: showSub ? 'auto' : 'none',
        }}
      >
        <XIcon />
      </button>
    </>
  )
}
