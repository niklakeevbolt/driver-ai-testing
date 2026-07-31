// Exact Figma layout (188:84853):
// - 3 tiles: 330×143, bg #eef1f0, rounded-16
// - tile 1: top 235, tile 2: top 401, tile 3: top 567
// - icon: 40×40, rounded-full, bg rgba(0,45,30,0.07), at left-21 top-22
// - label: 28px SemiBold #191f1c, letter-spacing -0.616px, at left-21 top-72
// - header: "Safety" (Heading M) + subtitle (Body M)
// - page nav status bar bg: black
import { AudioRecording, Call, Clear, ShareIos } from '@icons'

const TILES = [
  {
    id: 'emergency',
    label: 'Call emergency',
    sub: 'Call 112',
    top: 235,
    icon: <Call size="md" />,
  },
  {
    id: 'share',
    label: 'Share trip details',
    sub: 'Share location',
    top: 401,
    icon: <ShareIos size="md" />,
  },
  {
    id: 'record',
    label: 'Record call',
    sub: 'Audio recording',
    top: 567,
    icon: <AudioRecording size="md" />,
  },
]

export default function SafetyScreen({ goBack }) {
  return (
    <div className="screen" style={{ background: '#fff' }}>
      {/* Page Navigation — exact Figma structure */}
      {/* Status bar rendered by App.jsx */}

      {/* Top section: 44px status + 56px navigation = 100px */}
      <div style={{
        position: 'absolute',
        top: 44,
        left: 0,
        right: 0,
        background: '#fff',
        zIndex: 10,
      }}>
        {/* Navigation row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          minHeight: 56,
          padding: '8px 12px',
          gap: 8,
        }}>
          <div style={{ flex: 1, minWidth: 48 }} />
          <div style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }} />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="back-btn"
              onClick={goBack}
              style={{ color: 'var(--content-primary)' }}
            >
              <Clear size="lg" />
            </button>
          </div>
        </div>

        {/* Title + subtitle — px-24, pb-12 */}
        <div style={{ padding: '0 24px 12px' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontFeatureSettings: 'var(--ffs)',
            fontSize: 28,
            fontWeight: 600,
            color: 'var(--content-primary)',
            letterSpacing: '-0.616px',
            lineHeight: '36px',
            marginBottom: 8,
          }}>
            Safety
          </p>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontFeatureSettings: 'var(--ffs)',
            fontSize: 16,
            fontWeight: 400,
            color: 'var(--content-secondary)',
            letterSpacing: '-0.176px',
            lineHeight: '20px',
          }}>
            Features to help you feel safe and secure while driving
          </p>
        </div>
      </div>

      {/* 3 tiles — exact Figma positions relative to screen top */}
      {TILES.map(({ id, label, top, icon }) => (
        <button
          key={id}
          className="safety-tile"
          style={{ top }}
          onClick={() => {}}
        >
          {/* Icon: 40×40, rounded-full, bg rgba(0,45,30,0.07), at left-21 top-22 */}
          <div style={{
            position: 'absolute',
            left: 21,
            top: 22,
            width: 40,
            height: 40,
            borderRadius: '100px',
            background: 'var(--neutral-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--content-primary)',
          }}>
            {icon}
          </div>
          {/* Label: 28px SemiBold, at left-21 top-72 */}
          <p style={{
            position: 'absolute',
            left: 21,
            top: 72,
            fontFamily: 'var(--font-sans)',
            fontFeatureSettings: 'var(--ffs)',
            fontSize: 28,
            fontWeight: 600,
            color: 'var(--content-primary)',
            letterSpacing: '-0.616px',
            lineHeight: '36px',
            whiteSpace: 'nowrap',
          }}>
            {label}
          </p>
        </button>
      ))}
    </div>
  )
}
