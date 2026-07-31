import { useDevTools } from '../context/DevToolsContext'

const FONT = 'var(--font-sans)'

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0, fontFamily: FONT, fontSize: 11 }}>{label}</span>
      <span
        style={{
          color: 'var(--color-layer-floor-1)',
          fontFamily: 'monospace',
          textAlign: 'right',
          wordBreak: 'break-all',
          fontSize: 10,
        }}
      >
        {value}
      </span>
    </div>
  )
}

function ColorRow({ label, info }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
      <span style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0, fontFamily: FONT, fontSize: 11 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 2,
            flexShrink: 0,
            background: info.hex,
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        />
        <span
          style={{
            color: 'var(--color-layer-floor-1)',
            fontFamily: 'monospace',
            fontSize: 10,
            wordBreak: 'break-all',
            textAlign: 'right',
          }}
        >
          {info.token ?? info.hex}
        </span>
      </div>
    </div>
  )
}

export default function InspectPanel() {
  const { inspectMode, inspectData } = useDevTools()

  if (!inspectMode) return null

  return (
    <div
      style={{
        width: 240,
        flexShrink: 0,
        alignSelf: 'flex-start',
        background: '#1a1f2b',
        borderRadius: 12,
        overflow: 'hidden',
        fontFamily: FONT,
        boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Inspect
        </span>
        {inspectData ? (
          <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: 'var(--color-layer-floor-1)' }}>
            {inspectData.w} × {inspectData.h}
          </span>
        ) : null}
      </div>

      <div style={{ padding: '14px 16px' }}>
        {!inspectData ? (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: FONT, margin: 0, lineHeight: '18px' }}>
            Hover an element to inspect its properties
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
              style={{
                paddingBottom: 8,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                marginBottom: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              {inspectData.component ? (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: FONT,
                    color: 'var(--color-bg-promo-primary)',
                    background: 'rgba(91,104,246,0.15)',
                    borderRadius: 4,
                    padding: '2px 6px',
                    letterSpacing: '0.02em',
                  }}
                >
                  {inspectData.component}
                </span>
              ) : (
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                  {inspectData.tag}
                </span>
              )}
              {inspectData.component ? (
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                  {inspectData.tag}
                </span>
              ) : null}
            </div>

            {inspectData.padding.some((v) => v > 0) ? (
              <Row
                label="padding"
                value={
                  inspectData.padding.every((v) => v === inspectData.padding[0])
                    ? `${inspectData.padding[0]}px`
                    : `${inspectData.padding[0]} ${inspectData.padding[1]} ${inspectData.padding[2]} ${inspectData.padding[3]}`
                }
              />
            ) : null}

            {inspectData.bg ? <ColorRow label="bg" info={inspectData.bg} /> : null}

            {inspectData.hasText && inspectData.color ? <ColorRow label="color" info={inspectData.color} /> : null}

            {inspectData.radius ? <Row label="radius" value={inspectData.radius} /> : null}

            {inspectData.hasText ? (
              <Row
                label="type"
                value={
                  inspectData.textStyle
                    ? `${inspectData.textStyle} / w${inspectData.fontWeight}`
                    : `${inspectData.fontSize} / w${inspectData.fontWeight}`
                }
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
