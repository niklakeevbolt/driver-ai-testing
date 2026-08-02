// Exact Figma layout (190:35708):
// - Map bg: #e9eaee (light map style)
// - Top black bar: direction + distance, py-8 px-16, bg-black
// - Speedometer: 48×48, rounded-24, bg #ce0019 (danger), at left-11 top-246
// - Route FAB: 48×48, white, rounded-100, shadow el2, at right top-246
// - Earnings island: 113×48, white, rounded-28, shadow el2, centered, at top -89 (above bottom sheet)
// - FABs: sidebar left-11 top -89, inbox right top-186, report right top-186
// - Bottom sheet: top 314, rounded-24, shadow 0 -4 12 0.15, pt-32 pb-24 px-24, gap-16
// - Drag handle: black opacity-10, 60×6, rounded-10, at top-10 center
// - Ride metrics: 28px SemiBold center, 3 columns
// - Route card: bg #eef1f0, rounded-12, p-12, gap-8
// - Rider card: bg #eef1f0, rounded-12, p-12, gap-12
// - Break items: top/bottom separate rounded-12, separator #e1dede
// - Sticky footer: pb-20, px-24, gap-8; end-ride h-72 rounded-100 bg-black; FAB 72×72 white

import { useState } from 'react'
import {
  Alert,
  ArrowForward,
  Burger,
  Call,
  ChevronRight,
  CoffeeBreak,
  Comment,
  Edit,
  Inbox,
  MapDestination,
  Minus,
  Plus,
  Route,
  Send,
  Stop,
  User,
} from '@icons'
import { useCountry } from '../context/CountryContext.jsx'

// instruction banner ends ~y=96, bottom sheet starts y=314
// zoom 0 = far (3 big clusters), zoom 1 = medium (5 groups), zoom 2 = close (10 individual)
// Positions only — labels are swapped in per country.navigation.surgeLabels.
const SURGE_POSITIONS_BY_ZOOM = [
  [
    { id: 'f0', x: 168, y: 158 },
    { id: 'f1', x: 74,  y: 258 },
    { id: 'f2', x: 310, y: 234 },
  ],
  [
    { id: 'm0', x: 62,  y: 130 },
    { id: 'm1', x: 186, y: 118 },
    { id: 'm2', x: 312, y: 128 },
    { id: 'm3', x: 78,  y: 256 },
    { id: 'm4', x: 316, y: 236 },
  ],
  [
    { id: 'c0',  x: 44,  y: 118 },
    { id: 'c1',  x: 90,  y: 148 },
    { id: 'c2',  x: 158, y: 110 },
    { id: 'c3',  x: 212, y: 132 },
    { id: 'c4',  x: 276, y: 114 },
    { id: 'c5',  x: 336, y: 142 },
    { id: 'c6',  x: 52,  y: 238 },
    { id: 'c7',  x: 104, y: 276 },
    { id: 'c8',  x: 292, y: 218 },
    { id: 'c9',  x: 338, y: 254 },
  ],
]

const BLOB_SIZE  = [80, 56, 40]
const LABEL_SIZE = [14, 13, 12]

export default function NavigationScreen({ navigate, goBack }) {
  const country = useCountry()
  const [view, setView] = useState('ride')
  const [zoom, setZoom] = useState(1)

  const surgeLabels = country.navigation.surgeLabels
  const surgeByZoom = SURGE_POSITIONS_BY_ZOOM.map((positions) =>
    positions.map((pos, i) => ({ ...pos, label: surgeLabels[i % surgeLabels.length] }))
  )

  // bottom sheet Y offset (px from screen top). Figma: top 314 = ~37% of 852px
  const SHEET_TOP = 314

  return (
    <div className="screen" style={{ background: '#e9eaee', overflow: 'hidden' }}>

      {/* Map area — light style */}
      <div style={{ position: 'absolute', inset: 0, background: '#e9eaee', overflow: 'hidden' }}>
        {/* Light map roads */}
        <div style={{ position: 'absolute', top: 110, left: 0, right: 0, height: 14, background: '#d4d7de' }} />
        <div style={{ position: 'absolute', top: 200, left: 0, right: 0, height: 10, background: '#dcdfe5' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 100, width: 14, background: '#d4d7de' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 80, width: 10, background: '#dcdfe5' }} />
        {/* Route line */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <path
            d="M 200 180 C 180 220, 140 240, 110 290 S 80 360, 80 420"
            stroke="#32bb78"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="200" cy="180" r="7" fill="#32bb78"/>
          <circle cx="80" cy="420" r="9" fill="#2a313c"/>
        </svg>
        {/* Car pin */}
        <div style={{ position: 'absolute', top: 174, left: 188, fontSize: 20 }}>🚗</div>

        {/* Surge zones */}
        {surgeByZoom[zoom].map(zone => (
          <div key={zone.id} style={{
            position: 'absolute', top: zone.y, left: zone.x,
            transform: 'translate(-50%, -50%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 6,
          }}>
            <div style={{
              position: 'absolute',
              width: BLOB_SIZE[zoom], height: BLOB_SIZE[zoom],
              borderRadius: '50%',
              background: 'rgba(52,209,134,0.18)',
              border: '1.5px solid rgba(52,209,134,0.45)',
            }} />
            <div style={{
              position: 'relative', zIndex: 1,
              background: '#34d186', borderRadius: 100,
              padding: '3px 8px', whiteSpace: 'nowrap',
              fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
              fontSize: LABEL_SIZE[zoom], fontWeight: 700,
              color: '#fff', letterSpacing: '-0.1px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
            }}>
              {zone.label}
            </div>
          </div>
        ))}
      </div>

      {/* Zoom controls — between instruction banner (~y=96) and Report FAB (y=186) */}
      <div style={{
        position: 'absolute', top: 110, right: 11, zIndex: 11,
        display: 'flex', flexDirection: 'column',
        background: '#fff', borderRadius: 14,
        boxShadow: '0px 2px 8px rgba(0,0,0,0.15)', overflow: 'hidden',
      }}>
        <button
          onClick={() => setZoom(z => Math.min(z + 1, 2))}
          style={{
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <Plus size="xs" style={{ color: 'var(--content-primary)' }} />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 1, 0))}
          style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Minus size="xs" style={{ color: 'var(--content-primary)' }} />
        </button>
      </div>

      {/* Black top instruction banner — bg-black, px-16 py-8 */}
      <div style={{
        position: 'absolute',
        top: 44,
        left: 0,
        right: 0,
        background: '#000',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        zIndex: 10,
      }}>
        {/* Direction icon 36×36 */}
        <div style={{
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <ArrowForward size="xl" style={{ color: '#fafafb' }} />
        </div>
        {/* Street name */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontFeatureSettings: 'var(--ffs)',
            fontSize: 20,
            fontWeight: 600,
            color: '#fafafb',
            letterSpacing: '-0.34px',
            lineHeight: '25px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{country.navigation.banner}</p>
        </div>
        {/* Distance */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontFeatureSettings: 'var(--ffs)',
            fontSize: 14,
            fontWeight: 600,
            color: '#fafafb',
            letterSpacing: '-0.084px',
            lineHeight: '18px',
          }}>800 m</p>
        </div>
      </div>

      {/* Speedometer — 48×48, rounded-24, bg #ce0019, at left-11 */}
      {/* In the design it sits at absolute top-246 which is above the sheet that starts at 314 */}
      <div style={{
        position: 'absolute',
        top: 246,
        left: 11,
        width: 98,
        height: 48,
        zIndex: 10,
      }}>
        {/* Speed limit circle: bg-white border-black, rounded-24, size-48 */}
        <div style={{
          position: 'absolute',
          left: 0, top: 0,
          width: 48, height: 48,
          borderRadius: 24,
          background: '#fff',
          border: '4px solid rgba(0,16,10,0.51)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontFeatureSettings: 'var(--ffs)',
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--content-primary)',
            letterSpacing: '-0.34px',
            lineHeight: '25px',
          }}>50</p>
        </div>
        {/* Current speed: bg danger, rounded-24, size-48 */}
        <div style={{
          position: 'absolute',
          left: 0, top: 0,
          width: 48, height: 48,
          borderRadius: 24,
          background: '#ce0019',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: 8,
          paddingRight: 16,
        }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontFeatureSettings: 'var(--ffs)',
            fontSize: 20,
            fontWeight: 600,
            color: 'rgba(253,255,254,0.93)',
            letterSpacing: '-0.34px',
            lineHeight: '25px',
          }}>49</p>
        </div>
      </div>

      {/* Route FAB — right side, at top-246 */}
      <button
        className="fab"
        style={{ position: 'absolute', top: 246, right: 11, zIndex: 10 }}
      >
        <Route size="lg" style={{ color: 'var(--content-primary)' }} />
      </button>

      {/* Report FAB — right side, at top-186 */}
      <button
        className="fab"
        style={{ position: 'absolute', top: 186, right: 11, zIndex: 10 }}
      >
        <Alert size="lg" style={{ color: 'var(--content-primary)' }} />
      </button>

      {/* Inbox FAB — left side, at top-186 */}
      <button
        className="fab"
        style={{ position: 'absolute', top: 186, left: 11, zIndex: 10 }}
        onClick={() => navigate('bolt-hub')}
      >
        <Inbox size="lg" style={{ color: 'var(--content-primary)' }} />
      </button>

      {/* Earnings island — centered, at top 225 (314 - 89) */}
      <button
        className="earnings-island"
        style={{
          position: 'absolute',
          top: SHEET_TOP - 89,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}
        onClick={() => navigate('earnings')}
      >
        <span className="ei-value">{country.money.amount(country.earnings.today)}</span>
      </button>

      {/* Sidebar FAB — left-23, same height as earnings island */}
      <button
        className="fab"
        style={{ position: 'absolute', top: SHEET_TOP - 89, left: 23, zIndex: 10 }}
        onClick={() => navigate('sidebar')}
      >
        <User size="lg" style={{ color: 'var(--content-primary)' }} />
      </button>

      {/* Bottom Sheet — top 314, rounded-24, shadow, pt-32 pb-24 px-24, gap-16 */}
      <div style={{
        position: 'absolute',
        top: SHEET_TOP,
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0px -4px 12px 0px rgba(0,0,0,0.15)',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingTop: 32,
        paddingBottom: 120,
        paddingLeft: 24,
        paddingRight: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        {/* Drag handle: bg-black opacity-10, 60×6, rounded-10, top-10 */}
        <div style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 60,
          height: 6,
          background: 'rgba(0,0,0,0.10)',
          borderRadius: 10,
        }} />

        {view === 'ride' ? (
          <RideView setView={setView} country={country} />
        ) : (
          <ChatView goBack={() => setView('ride')} />
        )}
      </div>

      {/* Sticky footer: pb-20 px-24 gap-8, bg-white */}
      <div className="sticky-footer" style={{ gap: 8 }}>
        {/* End ride: h-72, rounded-100, bg-black, 24px SemiBold */}
        <button
          className="btn-primary btn-dark"
          style={{ flex: 1, height: 72 }}
          onClick={goBack}
        >
          End ride
        </button>
        {/* Action FAB: 72×72, white, rounded-100, shadow el2 */}
        <button
          style={{
            width: 72, height: 72,
            borderRadius: 100,
            background: '#fff',
            boxShadow: '0px 4px 12px 0px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
          onClick={() => setView(v => v === 'chat' ? 'ride' : 'chat')}
        >
          {view === 'chat' ? (
            <Burger size="xl" style={{ color: 'var(--content-primary)' }} />
          ) : (
            <Comment size="xl" style={{ color: 'var(--content-primary)' }} />
          )}
        </button>
      </div>
    </div>
  )
}

function RideView({ setView, country }) {
  return (
    <>
      {/* Ride metrics — Heading M (28px), 3 columns centered */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        width: '100%',
      }}>
        {['4.2 km', '6 min', '9:41'].map((v) => (
          <p key={v} style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: 'var(--font-sans)',
            fontFeatureSettings: 'var(--ffs)',
            fontSize: 28,
            fontWeight: 600,
            color: 'var(--content-primary)',
            letterSpacing: '-0.616px',
            lineHeight: '36px',
            minWidth: 0,
          }}>
            {v}
          </p>
        ))}
      </div>

      {/* Route card — bg #eef1f0, rounded-12, p-12, gap-8 */}
      <div className="route-card">
        {/* Icon column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Origin dot */}
          <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--content-secondary)' }} />
          </div>
          {/* Dashed line */}
          <div style={{ width: 1, height: 10, background: 'var(--content-secondary)', opacity: 0.4 }} />
          {/* Add stop */}
          <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid var(--content-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 7, height: 1, background: 'var(--content-secondary)' }} />
          </div>
          {/* Dashed line */}
          <div style={{ width: 1, height: 10, background: 'var(--content-secondary)', opacity: 0.4 }} />
          {/* Destination pin */}
          <MapDestination size="xs" style={{ color: 'rgba(0,10,7,0.63)' }} />
        </div>

        {/* Addresses column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flexShrink: 0 }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontFeatureSettings: "'cv03' 1, 'cv04' 1",
            fontSize: 18, fontWeight: 400,
            color: 'var(--content-secondary)',
            letterSpacing: '-0.252px',
            lineHeight: '22px',
            whiteSpace: 'nowrap',
          }}>
            {country.navigation.from}
          </p>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 18, fontWeight: 400,
            color: 'rgba(0,0,0,0.63)',
            letterSpacing: '-0.252px',
            lineHeight: '22px',
            whiteSpace: 'nowrap',
          }}>
            Add stop
          </p>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontFeatureSettings: "'cv03' 1, 'cv04' 1",
              fontSize: 18, fontWeight: 400,
              color: 'var(--content-secondary)',
              letterSpacing: '-0.252px',
              lineHeight: '22px',
              whiteSpace: 'nowrap',
            }}>
              {country.navigation.to}
            </p>
            <Edit size="xs" style={{ color: 'rgba(0,10,7,0.63)' }} />
          </div>
        </div>
      </div>

      {/* Rider card — bg #eef1f0, rounded-12, p-12, gap-12 */}
      <div className="rider-card">
        {/* Avatar 28×28 */}
        <div style={{
          width: 28, height: 28,
          borderRadius: '50%',
          border: '2px solid #fff',
          background: 'var(--neutral-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700,
          color: 'var(--content-secondary-solid)',
          flexShrink: 0,
          overflow: 'hidden',
        }}>M</div>
        {/* Name */}
        <p style={{
          flex: 1,
          fontFamily: 'var(--font-sans)',
          fontFeatureSettings: 'var(--ffs)',
          fontSize: 16, fontWeight: 400,
          color: 'var(--content-secondary)',
          letterSpacing: '-0.176px',
          lineHeight: '20px',
        }}>
          Maria Toledo
        </p>
        {/* Call button: 28×28, rounded-full, bg neutral-secondary */}
        <button className="icon-view" onClick={() => {}}>
          <Call size="xs" style={{ color: 'var(--content-primary)' }} />
        </button>
        {/* Chat button: 28×28, rounded-full, bg neutral-secondary */}
        <button className="icon-view" onClick={() => setView('chat')}>
          <Comment size="xs" style={{ color: 'var(--content-primary)' }} />
        </button>
      </div>

      {/* Break section — top/bottom rounded separately */}
      <div>
        {/* Top item */}
        <div className="break-item-top">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Stop size="md" style={{ color: 'var(--content-primary)' }} />
            <p style={{
              flex: 1,
              fontFamily: 'var(--font-sans)',
              fontFeatureSettings: "'cv03' 1, 'cv04' 1",
              fontSize: 18, fontWeight: 400,
              color: 'var(--content-primary-light)',
              letterSpacing: '-0.252px',
              lineHeight: '22px',
            }}>
              Stop new requests
            </p>
            <ChevronRight size="md" style={{ color: 'var(--content-primary)' }} />
          </div>
        </div>
        {/* Separator #e1dede */}
        <div className="break-separator" />
        {/* Bottom item */}
        <div className="break-item-bottom">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <CoffeeBreak size="md" style={{ color: 'var(--content-primary)' }} />
            <p style={{
              flex: 1,
              fontFamily: 'var(--font-sans)',
              fontFeatureSettings: "'cv03' 1, 'cv04' 1",
              fontSize: 18, fontWeight: 400,
              color: 'var(--content-primary-light)',
              letterSpacing: '-0.252px',
              lineHeight: '22px',
            }}>
              Go on break
            </p>
            <ChevronRight size="md" style={{ color: 'var(--content-primary)' }} />
          </div>
        </div>
      </div>
    </>
  )
}

function ChatView() {
  const [message, setMessage] = useState('')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div className="chat-bubble driver">I'm on my way</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div className="chat-bubble rider">Ok, see you soon!</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div className="chat-bubble driver">Stuck in traffic, 2 more mins</div>
        </div>
      </div>

      {/* Quick replies */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }} className="hide-scroll">
        {['Stuck in traffic', "I'm on my way", 'Be there soon'].map(t => (
          <button key={t} className="quick-reply">{t}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--neutral-secondary)',
        borderRadius: 24, padding: '10px 16px',
      }}>
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type message..."
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            fontSize: 14, color: 'var(--content-primary)',
            fontFamily: 'var(--font-sans)',
          }}
        />
        <button style={{ color: 'var(--green)', display: 'flex' }}>
          <Send size="md" />
        </button>
      </div>
    </div>
  )
}
