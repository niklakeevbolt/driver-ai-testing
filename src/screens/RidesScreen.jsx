// Updated with exact Figma design tokens
// Key measurements from Figma:
// - Filter chips: h-32, rounded-8, px-8 py-6 (but rendered as height 32)
// - Tab bar: h-77, shadow 0 6px 24px rgba(0,0,0,0.24)
// - Ride items: padding 12px 20px, gap 12
// - Back button: 48×48, rounded-100
// - Filter chip active: bg #2a313c (content-primary-light), color white
// - Filter chip inactive: bg rgba(0,45,30,0.07), color #191f1c
// - Summary stats: bg #f9fafb, borderBottom #f3f4f6

import { useState } from 'react'
import { IconBack, IconTrips, IconMap, IconHub, IconUser } from '../icons'
import { useCountry } from '../context/CountryContext.jsx'

const FILTERS = ['All rides', 'Today', 'This week', 'Completed', 'Cancelled']

export default function RidesScreen({ navigate, goBack }) {
  const country = useCountry()
  const [activeFilter, setActiveFilter] = useState('All rides')

  const rides = country.rides.list.map((ride) => ({ ...ride, amount: country.money.spaced(ride.amount) }))
  const summary = [
    { label: 'Rides', value: String(rides.length) },
    { label: 'Earnings', value: country.money.spaced(country.rides.summaryEarnings) },
    { label: 'Distance', value: country.rides.summaryDistance },
  ]

  return (
    <div className="screen" style={{ background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Page header */}
      <div style={{ background: '#fff', paddingTop: 54, flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '8px 16px 10px', gap: 8,
        }}>
          <button className="back-btn" onClick={goBack}>
            <IconBack />
          </button>
          <div style={{
            flex: 1, textAlign: 'center',
            fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
            fontSize: 17, fontWeight: 700, color: '#111827',
          }}>Rides</div>
          <button style={{
            width: 36, height: 36, borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#374151',
          }}>⋯</button>
        </div>

        {/* Filter chips — h-32, rounded-8 */}
        <div style={{
          display: 'flex', gap: 8, padding: '0 16px 12px',
          overflowX: 'auto',
        }} className="hide-scroll">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`filter-chip ${activeFilter === f ? 'active' : 'inactive'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary row */}
      <div style={{
        display: 'flex', gap: 0,
        background: '#f9fafb',
        borderBottom: '1px solid #f3f4f6',
        flexShrink: 0,
      }}>
        {summary.map(({ label, value }, i) => (
          <div key={label} style={{
            flex: 1, padding: '10px 0', textAlign: 'center',
            borderLeft: i > 0 ? '1px solid #e5e7eb' : 'none',
          }}>
            <div style={{
              fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
              fontSize: 16, fontWeight: 800, color: '#111827', letterSpacing: -0.4,
            }}>{value}</div>
            <div style={{
              fontSize: 11, color: '#9ca3af', fontWeight: 500, marginTop: 1, fontFamily: 'var(--font-sans)',
            }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Rides list */}
      <div className="scroll-content" style={{ paddingBottom: 80 }}>
        {rides.map(({ id, from, to, time, km, amount, rating, type, highlight }) => (
          <div
            key={id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 20px',
              borderBottom: '1px solid #f9fafb',
              background: highlight ? '#f0fdf6' : '#fff',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 13, flexShrink: 0,
              background: highlight ? '#dcfcec' : '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              {highlight ? '✈️' : '🚗'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
                fontSize: 14, fontWeight: 700, color: '#111827',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginBottom: 3,
              }}>
                {from}
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13, color: '#6b7280',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                → {to}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{
                  fontSize: 11, color: '#9ca3af', fontWeight: 500, fontFamily: 'var(--font-sans)',
                }}>{time}</span>
                <span style={{ width: 3, height: 3, borderRadius: 2, background: '#d1d5db' }} />
                <span style={{
                  fontSize: 11, color: '#9ca3af', fontWeight: 500, fontFamily: 'var(--font-sans)',
                }}>{km}</span>
                <span style={{ width: 3, height: 3, borderRadius: 2, background: '#d1d5db' }} />
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  color: type === 'XL' ? '#7c3aed' : '#374151',
                  background: type === 'XL' ? '#ede9fe' : '#f3f4f6',
                  padding: '1px 6px', borderRadius: 6,
                }}>{type}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
                fontSize: 15, fontWeight: 800, color: '#111827', letterSpacing: -0.3,
              }}>{amount}</div>
              <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 2 }}>
                {'★'.repeat(rating)}
              </div>
            </div>
          </div>
        ))}
        <div style={{ height: 16 }} />
      </div>

      {/* Tab bar — h-77, shadow */}
      <div className="tab-bar">
        {[
          { icon: <IconTrips />, label: 'Trips', active: true },
          { icon: <IconMap />, label: 'Map', screen: 'home' },
          { icon: <IconHub />, label: 'Hub', screen: 'bolt-hub' },
          { icon: <IconUser />, label: 'Account', screen: 'sidebar' },
        ].map(({ icon, label, active, screen }) => (
          <button
            key={label}
            className={`tab-bar-item ${active ? 'active' : ''}`}
            onClick={() => screen && navigate(screen)}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
