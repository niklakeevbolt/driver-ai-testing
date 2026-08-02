// Updated with exact Figma design tokens (153:42224)
// Key changes from V1:
// - Header bg: #111827 (correct Bolt dark)
// - Today net label: 12px uppercase rgba(255,255,255,0.5)
// - Net amount: 44px fw900 white
// - Trend: 13px #34D186 (note: this screen uses the original green, not the Figma green #32bb78)
// - Week chart: past bars #dcfcec, today bar #34D186
// - Stat tiles: bg #f9fafb, border #f3f4f6, rounded-12
// - Balance: bg #f9fafb, rounded-14, border #f3f4f6
// - Goal: bg #f0fdf6, border #dcfcec, rounded-14
// - Progress: .progress-track / .progress-fill (silver colors from App.css)
// - Trip rows: padding 10px 20px, gap 12
// All typography and colors match App.css tokens where applicable

import { IconBack } from '../icons'
import { useCountry } from '../context/CountryContext.jsx'

export default function EarningsScreen({ navigate, goBack }) {
  const country = useCountry()
  const { earnings, rates, money } = country

  const weekData = earnings.week
  const trips = earnings.trips.map((trip) => ({ ...trip, amount: money.spaced(trip.amount) }))
  const stats = [
    { label: 'Online time', value: '6h 32m' },
    { label: 'Rides', value: '7' },
    { label: 'Acceptance', value: rates.earningsAcceptance },
    { label: 'Completion', value: '100%' },
    { label: 'Avg. rating', value: '4.95' },
    { label: 'Long rides', value: '2' },
  ]

  const maxWeek = Math.max(...weekData.map(d => d.amount))

  return (
    <div className="screen" style={{ background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Dark header */}
      <div style={{ background: '#111827', paddingTop: 54, paddingBottom: 20, flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '8px 16px 16px', gap: 8,
        }}>
          <button className="back-btn" onClick={goBack} style={{ color: 'rgba(255,255,255,0.7)' }}>
            <IconBack />
          </button>
          <div style={{
            flex: 1, textAlign: 'center',
            fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
            fontSize: 17, fontWeight: 700, color: '#fff',
            letterSpacing: '-0.3px',
          }}>Earnings</div>
          <button style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 16,
          }}>⋯</button>
        </div>

        {/* Today net */}
        <div style={{ textAlign: 'center', padding: '0 20px 16px' }}>
          <div style={{
            fontSize: 12, fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: 0.5, textTransform: 'uppercase',
            marginBottom: 4, fontFamily: 'var(--font-sans)',
          }}>Today's net</div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
            fontSize: 44, fontWeight: 900, color: '#fff', letterSpacing: -2,
          }}>{money.amount(earnings.todayNet)}</div>
          <div style={{
            fontSize: 13, color: '#34D186', fontWeight: 600,
            marginTop: 4, fontFamily: 'var(--font-sans)',
          }}>↑ 12% vs last Sunday</div>
        </div>

        {/* Quick stat tiles */}
        <div style={{ display: 'flex', gap: 8, padding: '0 16px' }}>
          {[
            { icon: '🕐', label: 'Online', value: '6h 32m' },
            { icon: '💳', label: 'Payout', value: money.amount(earnings.payout) },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{
              flex: 1, background: 'rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '10px 12px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>{label}</div>
                <div style={{
                  fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
                  fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: -0.4,
                }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="scroll-content">
        {/* Week chart */}
        <div style={{ padding: '16px 20px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{
              fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
              fontSize: 15, fontWeight: 700, color: '#111827',
            }}>This week</div>
            <button style={{
              fontSize: 13, color: '#1db870', fontWeight: 600, fontFamily: 'var(--font-sans)',
            }} onClick={() => navigate('rides')}>See all →</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 90 }}>
            {weekData.map(({ day, amount, today }) => (
              <div key={day} style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', height: '100%', justifyContent: 'flex-end',
              }}>
                <div style={{
                  fontSize: 9, fontWeight: 700,
                  color: today ? '#111827' : '#9ca3af',
                  marginBottom: 3, fontFamily: 'var(--font-sans)',
                }}>
                  {money.amount(amount, { decimals: 0 })}
                </div>
                <div style={{
                  width: '100%',
                  height: `${(amount / maxWeek) * 72}px`,
                  background: today ? '#34D186' : '#dcfcec',
                  borderRadius: '4px 4px 0 0',
                  minHeight: 4,
                  position: 'relative',
                }}>
                  {today && (
                    <div style={{
                      position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
                      background: '#111827', color: '#fff', fontSize: 9, fontWeight: 700,
                      padding: '2px 5px', borderRadius: 6, whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-sans)',
                    }}>Today</div>
                  )}
                </div>
                <div style={{
                  fontSize: 10, color: today ? '#1db870' : '#9ca3af',
                  fontWeight: 600, marginTop: 4, fontFamily: 'var(--font-sans)',
                }}>{day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stat tiles */}
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {stats.map(({ label, value }) => (
              <div key={label} style={{
                background: '#f9fafb', borderRadius: 12, padding: '10px 12px',
                border: '1px solid #f3f4f6',
              }}>
                <div style={{
                  fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
                  fontSize: 18, fontWeight: 800, color: '#111827', letterSpacing: -0.5,
                }}>{value}</div>
                <div style={{
                  fontSize: 11, color: '#9ca3af', fontWeight: 500, marginTop: 2, fontFamily: 'var(--font-sans)',
                }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border-separator)', margin: '0' }} />

        {/* Balance */}
        <div style={{ padding: '14px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{
              fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
              fontSize: 15, fontWeight: 700, color: '#111827',
            }}>Balance</div>
            <button style={{ fontSize: 13, color: '#1db870', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>Withdraw →</button>
          </div>
          <div style={{
            background: '#f9fafb', borderRadius: 14, padding: '14px 16px',
            border: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 2, fontFamily: 'var(--font-sans)',
              }}>Available</div>
              <div style={{
                fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
                fontSize: 28, fontWeight: 900, color: '#111827', letterSpacing: -0.8,
              }}>{money.amount(earnings.payout)}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <button style={{
                height: 34, padding: '0 16px',
                background: '#111827', color: '#fff',
                borderRadius: 10,
                fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
                fontSize: 13, fontWeight: 700,
              }}>Withdraw</button>
              <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'var(--font-sans)' }}>Instant · 0% fee</div>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border-separator)' }} />

        {/* Earnings goal */}
        <div style={{ padding: '14px 20px' }}>
          <div style={{
            fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
            fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 10,
          }}>Earnings goal</div>
          <div style={{
            background: '#f0fdf6', borderRadius: 14, padding: '14px 16px',
            border: '1px solid #dcfcec',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{
                fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
                fontSize: 13, color: '#374151', fontWeight: 600,
              }}>Weekly goal</div>
              <div style={{
                fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
                fontSize: 13, fontWeight: 700, color: '#1db870',
              }}>{money.amount(earnings.payout)} / {money.amount(earnings.goal, { decimals: 0 })}</div>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.min(100, (earnings.payout / earnings.goal) * 100)}%` }} />
            </div>
            <div style={{
              fontSize: 12, color: '#6b7280', marginTop: 6, fontFamily: 'var(--font-sans)',
            }}>{money.amount(earnings.goalRemaining)} remaining · 4 days left</div>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border-separator)' }} />

        {/* Recent rides */}
        <div style={{ padding: '14px 0 0' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0 20px 10px',
          }}>
            <div style={{
              fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
              fontSize: 15, fontWeight: 700, color: '#111827',
            }}>Recent rides</div>
            <button style={{
              fontSize: 13, color: '#1db870', fontWeight: 600, fontFamily: 'var(--font-sans)',
            }} onClick={() => navigate('rides')}>See all →</button>
          </div>

          {trips.map(({ id, from, to, time, amount, km, rating }) => (
            <div key={id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 20px',
              borderBottom: '1px solid #f9fafb',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>🚗</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
                  fontSize: 13, fontWeight: 700, color: '#111827',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {from} → {to}
                </div>
                <div style={{
                  fontSize: 12, color: '#9ca3af', marginTop: 1, fontFamily: 'var(--font-sans)',
                }}>
                  {time} · {km} · {'★'.repeat(rating)}
                </div>
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
                fontSize: 15, fontWeight: 800, color: '#111827', letterSpacing: -0.3, flexShrink: 0,
              }}>{amount}</div>
            </div>
          ))}

          <div style={{ padding: '10px 20px 32px' }}>
            <button
              style={{
                width: '100%', height: 46, borderRadius: 12,
                background: '#f3f4f6',
                fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
                fontSize: 14, fontWeight: 600, color: '#374151',
              }}
              onClick={() => navigate('rides')}
            >
              View all rides
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
