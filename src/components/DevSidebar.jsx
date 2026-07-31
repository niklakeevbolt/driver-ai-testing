import { useState } from 'react'
import { DeviceFrameTopBar } from '@shell'
import { useDevTools } from '../context/DevToolsContext'

const FONT = 'var(--font-sans)'

const SCREENS = [
  { id: 'home', label: 'Home' },
  { id: 'earnings', label: 'Earnings' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'rides', label: 'Trip history' },
  { id: 'safety', label: 'Safety' },
]

const HUB_SCENARIOS = [
  { id: 'tasks', label: 'With tasks' },
  { id: 'none', label: 'No tasks' },
  { id: 'support', label: 'With support message' },
]

function CollapsibleSection({ label, description, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: 0,
          marginBottom: description ? 4 : 16,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-content-secondary)',
            fontFamily: FONT,
            margin: 0,
          }}
        >
          {label}
        </p>
        <Chevron open={open} />
      </button>
      {description ? (
        <p
          style={{
            fontSize: 12,
            color: 'var(--color-content-secondary)',
            fontFamily: FONT,
            lineHeight: '17px',
            margin: open ? '0 0 20px' : 0,
          }}
        >
          {description}
        </p>
      ) : null}
      {open ? <div>{children}</div> : null}
    </div>
  )
}

function Chevron({ open, size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        color: 'var(--color-content-action-primary)',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.15s ease',
        flexShrink: 0,
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function ScenarioRow({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '7px 4px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        borderRadius: 8,
        textAlign: 'left',
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          flexShrink: 0,
          border: `2px solid ${active ? 'var(--color-bg-action-primary)' : 'var(--color-border-neutral-primary)'}`,
          background: active ? 'var(--color-bg-action-primary)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {active ? <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'white' }} /> : null}
      </div>
      <span
        style={{
          fontSize: 14,
          lineHeight: '20px',
          fontFamily: FONT,
          fontWeight: active ? 600 : 400,
          color: active ? 'var(--color-content-primary)' : 'var(--color-content-secondary)',
        }}
      >
        {label}
      </span>
    </button>
  )
}

function ScreenScenarios({ currentScreen, onNavigate }) {
  return (
    <CollapsibleSection label="Select screen" description="Jump between app screens quickly.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {SCREENS.map(({ id, label }) => (
          <ScenarioRow
            key={id}
            label={label}
            active={currentScreen === id}
            onClick={() => onNavigate(id)}
          />
        ))}
      </div>
    </CollapsibleSection>
  )
}

function HubScenarios({ scenario, onScenarioChange }) {
  return (
    <CollapsibleSection
      label="Bolt Hub"
      description="Preview inbox tasks, badge counts, and support messages."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {HUB_SCENARIOS.map(({ id, label }) => (
          <ScenarioRow
            key={id}
            label={label}
            active={scenario === id}
            onClick={() => onScenarioChange(id)}
          />
        ))}
      </div>
    </CollapsibleSection>
  )
}

export function InspectToggle() {
  const { inspectMode, setInspectMode } = useDevTools()
  return (
    <button
      type="button"
      onClick={() => setInspectMode(!inspectMode)}
      title={inspectMode ? 'Inspect on — hover elements to see specs' : 'Turn on inspect mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 9999,
        border: `1.5px solid ${inspectMode ? 'var(--color-border-action-primary)' : 'var(--color-border-neutral-secondary)'}`,
        background: inspectMode ? 'var(--color-bg-action-secondary)' : 'transparent',
        color: inspectMode ? 'var(--color-content-action-primary)' : 'var(--color-content-secondary)',
        fontSize: 11,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: FONT,
        transition: 'all 0.15s ease',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
      Inspect
    </button>
  )
}

export function TopBar() {
  return <DeviceFrameTopBar rightSlot={<InspectToggle />} />
}

export default function DevSidebar({
  currentScreen,
  onNavigate,
  scenario,
  onScenarioChange,
  onClose,
}) {
  return (
    <div
      style={{
        width: 380,
        background: 'var(--color-layer-floor-0-grouped)',
        borderRight: '1px solid rgba(0,0,0,0.08)',
        fontFamily: FONT,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '24px 24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-content-primary)', fontFamily: FONT }}>
            Driver App Redesign
          </span>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-content-secondary)',
                fontSize: 18,
                lineHeight: 1,
                padding: 4,
                borderRadius: 6,
              }}
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--color-border-separator)' }} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
        <div style={{ padding: '24px 0' }}>
          <ScreenScenarios currentScreen={currentScreen} onNavigate={onNavigate} />
        </div>

        <div style={{ height: 1, background: 'var(--color-border-separator)', margin: '0 -24px' }} />

        <div style={{ padding: '24px 0' }}>
          <HubScenarios scenario={scenario} onScenarioChange={onScenarioChange} />
        </div>
      </div>
    </div>
  )
}
