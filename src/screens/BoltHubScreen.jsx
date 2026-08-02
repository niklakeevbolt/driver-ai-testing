import { useState } from 'react'
import {
  CashDriver,
  Clear,
  ChevronRight,
  Comment,
  Lightbulb,
  Package,
  SafetyShield,
  Search,
  Send,
} from '@icons'
import { StackOfDocumentsIllustration } from '../components/Illustrations.jsx'
import SlidingTabPanels from '../components/SlidingTabPanels.jsx'
import { useCountry } from '../context/CountryContext.jsx'
import { daysAgoStamp, todayTimeStamp } from '../data/dates.js'

const FF = { fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)' }

// ─── Update list item ─────────────────────────────────────────────

function UpdateItem({ date, title, subtitle, hasIndicator }) {
  return (
    <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 12, paddingBottom: 12, position: 'relative', borderBottom: '1px solid rgba(0,45,30,0.07)' }}>
      <p style={{ ...FF, fontSize: 14, fontWeight: 400, color: 'rgba(0,10,7,0.63)', letterSpacing: '-0.084px', lineHeight: '20px' }}>
        {date}
      </p>
      <p style={{ ...FF, fontSize: 16, fontWeight: hasIndicator ? 600 : 400, color: '#191f1c', letterSpacing: '-0.176px', lineHeight: '20px', paddingTop: 2, paddingBottom: 2 }}>
        {title}
      </p>
      <p style={{ ...FF, fontSize: 14, fontWeight: 400, color: 'rgba(0,10,7,0.63)', letterSpacing: '-0.084px', lineHeight: '20px' }}>
        {subtitle}
      </p>
      {hasIndicator && (
        <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: '#191f1c' }} />
      )}
    </div>
  )
}

// ─── Inbox tab ────────────────────────────────────────────────────

function InboxTab({ hasTasks, country }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 40 }}>

      {/* Tasks */}
      {hasTasks && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 32 }}>
          <div style={{ paddingLeft: 24, paddingRight: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ ...FF, fontSize: 32, fontWeight: 600, color: '#191f1c', letterSpacing: '-0.704px', lineHeight: '40px' }}>
              Tasks
            </p>
            <p style={{ ...FF, fontSize: 14, color: '#191f1c', lineHeight: '20px', letterSpacing: '-0.084px' }}>
              <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.176px' }}>1</span>
              {' task to complete'}
            </p>
          </div>

          {/* Task card */}
          <div style={{ paddingLeft: 24, paddingRight: 24 }}>
            <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 80, height: 80, flexShrink: 0 }}>
                <StackOfDocumentsIllustration
                  status="alert"
                  alt=""
                  className="size-full object-contain grayscale"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p style={{ ...FF, fontSize: 24, fontWeight: 600, color: '#191f1c', letterSpacing: '-0.48px', lineHeight: '30px' }}>
                  Your driving license has expired
                </p>
                <p style={{ ...FF, fontSize: 14, fontWeight: 400, color: 'rgba(0,10,7,0.63)', letterSpacing: '-0.084px', lineHeight: '20px' }}>
                  Upload a new driving license to keep driving
                </p>
              </div>
              <button style={{
                ...FF, fontSize: 16, fontWeight: 600, color: '#fff',
                background: '#404040', borderRadius: 9600,
                minHeight: 48, paddingLeft: 20, paddingRight: 20,
                letterSpacing: '-0.176px', lineHeight: '24px', alignSelf: 'flex-start',
              }}>
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Updates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: hasTasks ? 40 : 32 }}>
        {hasTasks && (
          <div style={{ paddingLeft: 24, paddingRight: 24 }}>
            <p style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#191f1c', letterSpacing: '-0.34px', lineHeight: '25px' }}>
              Updates
            </p>
          </div>
        )}
        <div>
          <UpdateItem date="Today"  title={`Earn ${country.money.amount(country.hub.inviteAmount, { decimals: 0 })}`} subtitle="Invite friends to drive" hasIndicator />
          <UpdateItem date={daysAgoStamp(3)} title="Safety toolkit"  subtitle="Learn how to stay safe during trips" />
          <UpdateItem date={daysAgoStamp(8)} title="Five star trips"  subtitle="How to get five star ratings" />
          <UpdateItem date={daysAgoStamp(9)} title="Safety toolkit"  subtitle="Learn how to stay safe during trips" />
        </div>
      </div>

    </div>
  )
}

// ─── Help tab ─────────────────────────────────────────────────────

function SectionDivider() {
  return <div style={{ height: 8, background: '#f0f2f5' }} />
}

function SectionHeader({ title, seeAll, paddingTop = 24 }) {
  return (
    <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop, paddingBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <p style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#191f1c', letterSpacing: '-0.34px', lineHeight: '24px' }}>
        {title}
      </p>
      {seeAll && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <p style={{ ...FF, fontSize: 16, fontWeight: 600, color: '#888', letterSpacing: '-0.176px', lineHeight: '20px' }}>
            See all
          </p>
          <ChevronRight size="xs" style={{ color: '#888' }} />
        </div>
      )}
    </div>
  )
}

function TripItem({ date, destination, amount, status }) {
  return (
    <div style={{ paddingLeft: 24, paddingRight: 56, paddingTop: 12, paddingBottom: 12, minHeight: 96, borderBottom: '1px solid rgba(0,45,30,0.07)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
      <p style={{ ...FF, fontSize: 14, color: 'rgba(0,10,7,0.63)', letterSpacing: '-0.084px', lineHeight: '20px' }}>
        {date}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ ...FF, fontSize: 16, color: '#191f1c', letterSpacing: '-0.176px', lineHeight: '24px' }}>
          {destination}
        </p>
        {amount && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CashDriver size="sm" style={{ color: '#191f1c', flexShrink: 0 }} aria-hidden="true" />
            <p style={{ ...FF, fontSize: 16, fontWeight: 600, color: '#191f1c', letterSpacing: '-0.176px', lineHeight: '24px' }}>
              {amount}
            </p>
          </div>
        )}
      </div>
      <p style={{ ...FF, fontSize: 14, color: 'rgba(0,10,7,0.63)', letterSpacing: '-0.084px', lineHeight: '20px' }}>
        {status}
      </p>
      <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)' }}>
        <ChevronRight size="md" style={{ color: 'rgba(0,10,7,0.63)' }} />
      </div>
    </div>
  )
}

function SupportItem({ icon: Icon, label }) {
  return (
    <div style={{ paddingLeft: 24, paddingRight: 24, minHeight: 56, display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid rgba(0,45,30,0.07)', position: 'relative' }}>
      <Icon size="md" style={{ color: '#191f1c', flexShrink: 0 }} aria-hidden="true" />
      <p style={{ flex: 1, ...FF, fontSize: 16, color: '#191f1c', letterSpacing: '-0.176px', lineHeight: '24px' }}>
        {label}
      </p>
      <ChevronRight size="md" style={{ color: 'rgba(0,10,7,0.63)' }} />
    </div>
  )
}

function DriverGuideCard({ title, icon: Icon }) {
  return (
    <div style={{ width: 134, flexShrink: 0 }}>
      <div style={{
        width: 134, height: 134, borderRadius: 12,
        background: '#f0f2f5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: 40, height: 40, color: '#c4c9c7', flexShrink: 0 }}>
          <Icon size="xxl" style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
      <p style={{ ...FF, fontSize: 16, color: '#191f1c', letterSpacing: '-0.176px', lineHeight: '20px', paddingTop: 8 }}>
        {title}
      </p>
    </div>
  )
}

function MessagesSection() {
  return (
    <div>
      <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#191f1c', letterSpacing: '-0.34px', lineHeight: '24px' }}>
          Messages
        </p>
        <p style={{ ...FF, fontSize: 16, fontWeight: 600, color: '#888', letterSpacing: '-0.176px', lineHeight: '20px' }}>
          See all
        </p>
      </div>
      <div style={{ paddingLeft: 16, paddingRight: 24, paddingTop: 12, paddingBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0f2f5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Comment size="md" style={{ color: '#606060' }} />
          <div style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: '#191f1c' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <p style={{ ...FF, fontSize: 16, fontWeight: 600, color: '#191f1c', letterSpacing: '-0.176px', lineHeight: '24px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            I don't receive orders
          </p>
          <p style={{ ...FF, fontSize: 14, color: 'rgba(0,10,7,0.63)', letterSpacing: '-0.084px', lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Could you please provide more details?..
          </p>
        </div>
      </div>
    </div>
  )
}

function HelpTab({ hasSupportMsg, country }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 40 }}>

      {/* Messages — shown in "with support message" scenario */}
      {hasSupportMsg && (
        <>
          <MessagesSection />
          <SectionDivider />
        </>
      )}

      {/* Get help with a trip */}
      <div>
        <SectionHeader title="Get help with a trip" seeAll paddingTop={36} />
        <TripItem date={todayTimeStamp('11:45')} destination={country.hub.tripFrom} amount={country.money.spaced(country.hub.tripAmount)} status="Finished" />
        <TripItem date={todayTimeStamp('12:15')} destination={country.hub.tripTo} status="Passenger did not show" />
      </div>

      <SectionDivider />

      {/* Get support */}
      <div>
        <SectionHeader title="Get support" />
        <SupportItem icon={Send} label="Send us a message" />
        <SupportItem icon={Comment} label="Messages" />
        <SupportItem icon={Search} label="Browse help articles" />
      </div>

      <SectionDivider />

      {/* Driver Guides */}
      <div>
        <SectionHeader title="Driver Guides" seeAll />
        <div
          className="hide-scroll"
          style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingLeft: 24, paddingRight: 24, paddingTop: 12, paddingBottom: 4 }}
        >
          <DriverGuideCard title="Essentials" icon={Lightbulb}     />
          <DriverGuideCard title="Cancellation fees" icon={SafetyShield} />
          <DriverGuideCard title="Bolt Send"  icon={Package}       />
        </div>
      </div>

    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────

export default function BoltHubScreen({ goBack, hasTasks, hasSupportMsg, updatesBadge = 2 }) {
  const country = useCountry()
  const [tab, setTab] = useState('inbox')

  return (
    <div className="screen" style={{ background: '#fff' }}>

      {/* Close button — matches profile TopBtn */}
      <button
        onClick={goBack}
        style={{
          position: 'absolute', top: 44, right: 24,
          width: 48, height: 48, borderRadius: 32,
          background: '#eef1f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#191f1c', zIndex: 10,
        }}
      >
        <Clear size="lg" />
      </button>

      {/* Tab bar — underline style matching Figma */}
      <div style={{
        position: 'absolute', top: 80, left: 0, right: 0,
        display: 'flex', zIndex: 10,
        borderBottom: '1px solid rgba(0,45,30,0.07)',
      }}>
        {[
          { id: 'inbox', label: 'Updates', badge: updatesBadge },
          { id: 'help',  label: 'Help', badge: hasSupportMsg ? 1 : null },
        ].map(({ id, label, badge }) => {
          const active = tab === id
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                minHeight: 48, paddingLeft: 8, paddingRight: 8, paddingTop: 8, paddingBottom: 8,
                position: 'relative',
                ...FF,
                fontSize: 16,
                fontWeight: active ? 600 : 400,
                color: active ? '#191f1c' : 'rgba(0,10,7,0.63)',
                letterSpacing: '-0.176px',
              }}
            >
              {label}
              {badge != null && (
                <div style={{
                  minWidth: 18, height: 18, borderRadius: 9600,
                  background: '#191f1c', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, lineHeight: 1,
                  paddingLeft: 5, paddingRight: 5, flexShrink: 0,
                }}>
                  {badge}
                </div>
              )}
              {active && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#191f1c', borderRadius: '2px 2px 0 0' }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Scrollable content */}
      <div
        className="hide-scroll"
        style={{ position: 'absolute', top: 129, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}
      >
        <SlidingTabPanels
          activeTab={tab}
          className="h-full"
          panelClassName="hide-scroll h-full overflow-y-auto"
          tabs={[
            { id: 'inbox', content: <InboxTab hasTasks={hasTasks} country={country} /> },
            { id: 'help', content: <HelpTab hasSupportMsg={hasSupportMsg} country={country} /> },
          ]}
        />
      </div>

    </div>
  )
}
