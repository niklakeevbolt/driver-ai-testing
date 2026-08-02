// Figma: Driver App IA — Preferences (1880:44171)
import { useState } from 'react'
import {
  ArrowBackward,
  Card,
  CashDriver,
  ChevronRight,
  Home,
  MoreAndroid,
  PinAlt,
} from '@icons'
import { useCountry } from '../context/CountryContext.jsx'

const FF = { fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)' }

const SEPARATOR = 'rgba(0,45,30,0.07)'
// Figma paints the gaps between grouped sections with a masked "Subtract"
// shape filled #EEF1F0; the same geometry is a page background of that colour
// showing through 8px gaps between rounded white sections.
const GROUP_GAP = '#eef1f0'

const DESTINATION_ICONS = { home: Home, pin: PinAlt }

function SettingRow({ title, subtitle, showSeparator }) {
  return (
    <button
      type="button"
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', minHeight: 68, padding: '12px 24px',
        position: 'relative', textAlign: 'left',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ ...FF, fontSize: 16, fontWeight: 400, lineHeight: '24px', letterSpacing: '-0.18px', color: 'var(--content-primary)' }}>
          {title}
        </p>
        <p style={{ ...FF, fontSize: 14, fontWeight: 400, lineHeight: '20px', letterSpacing: '-0.084px', color: 'var(--content-secondary)' }}>
          {subtitle}
        </p>
      </div>
      <ChevronRight size="lg" style={{ color: 'rgba(0,10,7,0.45)', flexShrink: 0 }} />
      {showSeparator ? (
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 0, height: 1, background: SEPARATOR }} />
      ) : null}
    </button>
  )
}

function SectionHeader({ title, subtitle, action, paddingTop, paddingBottom }) {
  return (
    <div style={{ padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <p style={{ ...FF, flex: 1, fontSize: 18, fontWeight: 600, lineHeight: '22px', letterSpacing: '-0.252px', color: 'var(--content-primary)' }}>
          {title}
        </p>
        {action ? (
          <button type="button" style={{ ...FF, fontSize: 16, fontWeight: 600, lineHeight: '20px', letterSpacing: '-0.176px', color: 'var(--content-primary)', flexShrink: 0 }}>
            {action}
          </button>
        ) : null}
      </div>
      {subtitle ? (
        <p style={{ ...FF, fontSize: 14, fontWeight: 400, lineHeight: '20px', letterSpacing: '-0.084px', color: 'var(--content-secondary)', paddingTop: 4 }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

function DestinationRow({ title, subtitle, icon: Icon, hasMenu, showSeparator }) {
  return (
    <div style={{ position: 'relative', height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}>
      <Icon size="lg" style={{ color: '#808c9f', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ ...FF, fontSize: 16, fontWeight: 400, lineHeight: '24px', letterSpacing: '-0.18px', color: '#2a313c' }}>
          {title}
        </p>
        <p style={{ ...FF, fontSize: 14, fontWeight: 400, lineHeight: '20px', letterSpacing: '-0.08px', color: '#808c9f' }}>
          {subtitle}
        </p>
      </div>
      {hasMenu ? (
        <button type="button" aria-label={`${title} options`} style={{ display: 'flex', flexShrink: 0 }}>
          <MoreAndroid size="lg" style={{ color: '#808c9f' }} />
        </button>
      ) : null}
      {showSeparator ? (
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 0, height: 1, background: SEPARATOR }} />
      ) : null}
    </div>
  )
}

function FilterChip({ label, value, icon: Icon }) {
  return (
    <button
      type="button"
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        height: 32, borderRadius: 8,
        padding: Icon ? '0 12px 0 8px' : '0 12px',
        border: `1px solid ${SEPARATOR}`,
        background: '#fff',
        ...FF, fontSize: 14, lineHeight: '18px', letterSpacing: '-0.084px',
        color: 'var(--content-primary)',
        whiteSpace: 'nowrap',
      }}
    >
      {Icon ? <Icon size="xs" style={{ flexShrink: 0 }} /> : null}
      <span style={{ fontWeight: 400 }}>
        {label}
        {value ? <span style={{ fontWeight: 600 }}>{` ${value}`}</span> : null}
      </span>
    </button>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{
        width: 52, height: 32, borderRadius: 100, flexShrink: 0,
        background: checked ? '#0e1010' : 'rgba(0,45,30,0.16)',
        padding: 2,
        display: 'flex', justifyContent: checked ? 'flex-end' : 'flex-start',
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: '50%', background: '#fff',
        boxShadow: '0px 2px 6px 0px rgba(0,0,0,0.16)',
        transition: 'transform 0.2s',
      }} />
    </button>
  )
}

export default function PreferencesScreen({ goBack }) {
  const country = useCountry()
  const [autoAccept, setAutoAccept] = useState(true)

  const settings = [
    { id: 'vehicle', title: 'Vehicle', subtitle: country.preferences.vehicle },
    { id: 'categories', title: 'Categories', subtitle: 'Bolt, Basic, Premium' },
    { id: 'navigation', title: 'Navigation', subtitle: 'Google Maps' },
  ]

  const destinations = country.preferences.destinations.map((item) => ({
    id: item.id,
    title: item.label,
    subtitle: item.address ?? [item.addressLine1, item.addressLine2].filter(Boolean).join(', '),
    icon: DESTINATION_ICONS[item.icon] ?? PinAlt,
    hasMenu: item.id === 'home',
  }))

  const filterChips = [
    { id: 'pickup', label: 'Pickup distance', value: '3 km' },
    { id: 'price', label: 'Price per km', value: country.preferences.priceFilter },
    { id: 'in-app', label: 'In-app', icon: Card },
    { id: 'cash', label: 'Cash', icon: CashDriver },
    { id: 'terminal', label: 'Card terminal', icon: Card },
  ]

  return (
    <div className="screen" style={{ background: GROUP_GAP }}>
      <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Page navigation + settings list */}
        <section style={{ background: '#fff', borderRadius: '0 0 16px 16px', paddingBottom: 12, flexShrink: 0 }}>
          <div style={{ paddingTop: 44 }}>
            <div style={{ display: 'flex', alignItems: 'center', minHeight: 56, padding: '8px 12px 0' }}>
              <button className="back-btn" onClick={goBack} aria-label="Back">
                <ArrowBackward size="lg" />
              </button>
            </div>
            <div style={{ padding: '0 24px 12px' }}>
              <p style={{ ...FF, fontSize: 28, fontWeight: 600, lineHeight: '36px', letterSpacing: '-0.616px', color: 'var(--content-primary)' }}>
                Preferences
              </p>
            </div>
          </div>

          {settings.map((item, i) => (
            <SettingRow
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              showSeparator={i < settings.length - 1}
            />
          ))}
        </section>

        {/* Rides toward destination */}
        <section style={{ background: '#fff', borderRadius: 16, paddingBottom: 12, flexShrink: 0 }}>
          <SectionHeader
            title="Rides toward destination"
            subtitle="4 uses available today"
            action="Edit"
            paddingTop={20}
            paddingBottom={4}
          />
          {destinations.map((item, i) => (
            <DestinationRow
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              hasMenu={item.hasMenu}
              showSeparator={i < destinations.length - 1}
            />
          ))}
        </section>

        {/* Auto-accept + filters */}
        <section style={{ background: '#fff', borderRadius: '16px 16px 0 0', paddingTop: 12, paddingBottom: 24, flexShrink: 0 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ ...FF, fontSize: 18, fontWeight: 600, lineHeight: '22px', letterSpacing: '-0.252px', color: 'var(--content-primary)' }}>
                Auto-accept
              </p>
              <p style={{ ...FF, fontSize: 14, fontWeight: 400, lineHeight: '20px', letterSpacing: '-0.084px', color: 'var(--content-secondary)', paddingTop: 4 }}>
                Rides that match all filters will be automatically accepted
              </p>
            </div>
            <Toggle checked={autoAccept} onChange={setAutoAccept} label="Auto-accept rides" />
            <div style={{ position: 'absolute', left: 24, right: 24, bottom: 0, height: 1, background: SEPARATOR }} />
          </div>

          <SectionHeader title="Filters" action="Edit" paddingTop={12} paddingBottom={12} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 11, padding: '0 24px' }}>
            {filterChips.map((chip) => (
              <FilterChip key={chip.id} label={chip.label} value={chip.value} icon={chip.icon} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
