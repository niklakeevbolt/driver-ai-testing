import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MapContainer, TileLayer, Polygon, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import {
  Calendar,
  ChevronRight,
  Clear,
  Filters,
  Inbox,
  Route,
  Surge,
  Time,
  User,
} from '@icons'

import { CarTopViewIllustration } from '../components/Illustrations.jsx'
import { useCountry } from '../context/CountryContext.jsx'
import 'leaflet/dist/leaflet.css'
import EarningsIsland from './EarningsIsland'

// ─── Leaflet icon fix (Vite) ──────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// DEMAND_BARS: 48 half-hour slots, midnight → midnight (shape shared; amounts are localised elsewhere)
const DEMAND_BARS = [
  10, 7, 5, 4, 4, 5, 7, 12, 22, 38, 52, 62,
  70, 76, 72, 68, 60, 55, 52, 50, 48, 54, 62, 72,
  80, 90, 95, 86, 74, 67, 60, 62, 66, 74, 84, 90,
  96, 98, 92, 82, 70, 58, 46, 36, 28, 20, 14, 9,
]
// After Preferences: local peak surge is gone — flatten peaks into a medium band.
const MEDIUM_DEMAND_BARS = DEMAND_BARS.map((v) => Math.round(Math.min(58, v * 0.58 + 8)))
const NOW_IDX = 21

function makeCarIcon() {
  const carMarkup = renderToStaticMarkup(
    <CarTopViewIllustration
      alt=""
      angle={18}
      loading="eager"
      style={{ width: 44, height: 56, objectFit: 'contain' }}
    />
  )

  return L.divIcon({
    className: '',
    html: `<div style="width:44px;height:56px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 3px 7px rgba(0,0,0,0.32));">${carMarkup}</div>`,
    iconSize: [44, 56],
    iconAnchor: [22, 48],
  })
}

function activityToHeatColor(activity) {
  // 52° = golden yellow, 4° = red — interpolate through orange
  const hue = Math.max(4, 52 - activity * 48)
  return `hsl(${hue}, 92%, 50%)`
}

function getZoneActivity(zone, barIdx, normalizedDemand) {
  const { peakStart, peakEnd } = zone
  const dist = barIdx >= peakStart && barIdx <= peakEnd
    ? 0
    : Math.min(Math.abs(barIdx - peakStart), Math.abs(barIdx - peakEnd))
  const peakProximity = Math.max(0, 1 - dist / 6)
  // 30% baseline (all zones scale with overall demand) + 70% peak bonus (spatially variable)
  return normalizedDemand * (0.3 + 0.7 * peakProximity)
}

// ─── Map sub-components ───────────────────────────────────────────

function MapController({ selectedZone, mapCenter, overviewZoom, zoneZoom }) {
  const map = useMap()
  useEffect(() => {
    if (selectedZone) {
      map.flyTo(selectedZone.center, zoneZoom, { duration: 0.55 })
    } else {
      map.flyTo(mapCenter, overviewZoom, { duration: 0.45 })
    }
  }, [selectedZone, map, mapCenter, overviewZoom, zoneZoom])
  return null
}

function MapClickHandler({ onDeselect }) {
  useMapEvents({ click: onDeselect })
  return null
}

function ZoomWatcher({ onChange }) {
  const map = useMap()
  useEffect(() => { onChange(map.getZoom()) }, [map, onChange])
  useMapEvents({ zoomend: (e) => onChange(e.target.getZoom()) })
  return null
}

function AnimatedSurgeLayer({ zone, visible, selected, onSelect, small, heatmapActivity }) {
  const map = useMap()

  // Animate pill opacity/scale via direct DOM manipulation so CSS transition plays
  useEffect(() => {
    if (heatmapActivity !== undefined) return
    const raf = requestAnimationFrame(() => {
      const pane = map.getPane('markerPane')
      const icon = pane?.querySelector(`.spw[data-zone="${zone.id}"]`)?.closest('.leaflet-marker-icon')
      if (!icon) return
      const wrap = icon.querySelector('.spw')
      if (!wrap) return
      wrap.style.opacity = visible ? '1' : '0'
      wrap.style.transform = visible ? 'scale(1)' : 'scale(0.82)'
      icon.style.pointerEvents = 'none'
    })
    return () => cancelAnimationFrame(raf)
  }, [visible, heatmapActivity, map, zone.id])

  const fs = small ? 11 : 13
  const padding = small ? '6px 12px 6px 8px' : '8px 16px 8px 12px'
  const icoSize = small ? 12 : 14
  const anchor = small ? 38 : 48

  // Memoised so the icon object reference stays stable — prevents Leaflet from
  // tearing down and recreating the DOM element, which would kill the transition.
  const surgeMarkup = renderToStaticMarkup(
    <Surge size="xs" style={{ color: '#fff', width: icoSize, height: icoSize, flexShrink: 0 }} />
  )
  const pillIcon = useMemo(() => L.divIcon({
    className: '',
    html: `<div class="spw" data-zone="${zone.id}" style="opacity:0;transform:scale(0.82);transition:opacity 0.32s ease-out,transform 0.32s cubic-bezier(0.34,1.08,0.64,1);transform-origin:bottom center;pointer-events:none;"><div style="background:${zone.color};color:#fff;padding:${padding};border-radius:20px;font-family:var(--font-sans);font-size:${fs}px;font-weight:700;letter-spacing:-0.1px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.22);display:flex;align-items:center;gap:5px;pointer-events:none;">${surgeMarkup}${zone.bonus}</div></div>`,
    iconSize: null,
    iconAnchor: [anchor, 16],
  }), [zone.color, zone.bonus, padding, fs, surgeMarkup, anchor])

  if (heatmapActivity !== undefined) {
    return (
      <Polygon
        positions={zone.polygon}
        pathOptions={{
          className: 'surge-blur',
          stroke: false,
          fillColor: activityToHeatColor(heatmapActivity),
          fillOpacity: Math.pow(heatmapActivity, 1.2) * 0.78,
        }}
      />
    )
  }

  return (
    <>
      <Polygon
        positions={zone.polygon}
        interactive={false}
        pathOptions={{
          className: 'surge-blur',
          stroke: false,
          fillColor: zone.fillColor,
          fillOpacity: visible ? (selected ? 0.80 : 0.58) : 0,
        }}
      />
      <Marker
        position={zone.center}
        icon={pillIcon}
        interactive={false}
      />
    </>
  )
}

// ─── Bottom sheet content ─────────────────────────────────────────

const AIRPORT_BARS = [17,13,17,14,14,12,24,29,33,34,50,61,67,72,67,61,50,45,36,40,32,37,35,40,50,76,84,75,96,85,93,89,95,77,72,56,76,61,48,35,27,38,44,59,84,63,38,17]
const AIRPORT_NOW_IDX = 28
const AIRPORT_MAX = Math.max(...AIRPORT_BARS)
const FF = { fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)' }

function CalendarIcon() {
  return <Calendar size="md" style={{ color: '#2a313c' }} />
}

function ChevronRightIcon() {
  return <ChevronRight size="md" style={{ color: '#9aa1a8' }} />
}

function RouteIcon() {
  return <Route size="xs" style={{ color: '#808c9f' }} />
}

function UserIcon() {
  return <User size="xs" style={{ color: '#808c9f' }} />
}

function SchedulingIcon() {
  return <Time size="xs" style={{ color: '#808c9f' }} />
}

function AirportChart() {
  const maxH = 64
  return (
    <div style={{ background: 'rgba(73,93,122,0.06)', borderRadius: 12, padding: '12px 14px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <p style={{ ...FF, fontSize: 12, fontWeight: 600, color: '#2f313f', letterSpacing: '-0.12px' }}>
            13 flights | 656 passengers
          </p>
          <p style={{ ...FF, fontSize: 12, fontWeight: 400, color: '#808c9f', marginTop: 2 }}>9–10 AM</p>
        </div>
        <SchedulingIcon />
      </div>
      <div style={{ height: maxH, display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
        {AIRPORT_BARS.map((v, i) => {
          const isPeak = i === AIRPORT_NOW_IDX
          const isPast = i < AIRPORT_NOW_IDX
          const bg = isPeak ? '#2f313f' : isPast ? 'rgba(73,93,122,0.25)' : 'rgba(73,93,122,0.35)'
          return (
            <div key={i} style={{
              flex: 1,
              height: `${(v / AIRPORT_MAX) * maxH}px`,
              background: bg,
              borderRadius: '2px 2px 0 0',
              minHeight: 2,
            }} />
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {['0', '6', '12', '18', '23'].map(t => (
          <span key={t} style={{ ...FF, fontSize: 10, fontWeight: 500, color: '#808c9f' }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

function CampaignCard({ campaign, style }) {
  const progress =
    campaign.active && campaign.target
      ? (campaign.completed ?? 0) / campaign.target
      : campaign.progress ?? 0
  const ordersLabel =
    campaign.active && campaign.target
      ? `Orders completed: ${campaign.completed ?? 0}/${campaign.target}`
      : campaign.target
        ? `${campaign.target} rides`
        : null

  return (
    <div
      style={{
        background: 'rgba(73,93,122,0.08)',
        border: '1px solid #ebedef',
        borderRadius: 16,
        padding: '14px 20px',
        ...style,
      }}
    >
      <p style={{ ...FF, fontSize: 14, fontWeight: 400, color: '#808c9f', letterSpacing: '-0.084px', marginBottom: 4 }}>
        {campaign.label}
      </p>
      <p style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#2f313f', letterSpacing: '-0.34px', marginBottom: 4 }}>
        {campaign.name}
      </p>
      {campaign.bonus ? (
        <p style={{
          ...FF, fontSize: 16, fontWeight: 600, color: '#191f1c', letterSpacing: '-0.176px',
          marginBottom: campaign.active || ordersLabel ? 10 : 0,
        }}>
          Earn {campaign.bonus}
          {!campaign.active && campaign.target ? ` · ${campaign.target} rides` : ''}
        </p>
      ) : null}
      {campaign.active ? (
        <>
          <div style={{ height: 4, background: '#d7dadf', borderRadius: 2, marginBottom: 6 }}>
            <div style={{ height: '100%', width: `${Math.round(progress * 100)}%`, background: '#808c9f', borderRadius: 2 }} />
          </div>
          {ordersLabel ? (
            <p style={{ ...FF, fontSize: 12, fontWeight: 400, color: '#808c9f' }}>{ordersLabel}</p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function ScheduledRideMeta({ km, rider }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <p style={{ ...FF, fontSize: 13, fontWeight: 400, color: '#808c9f', letterSpacing: '-0.084px' }}>Bolt</p>
      <span style={{ width: 1, height: 12, background: '#d7dadf', flexShrink: 0 }} />
      <RouteIcon />
      <p style={{ ...FF, fontSize: 13, fontWeight: 400, color: '#808c9f', letterSpacing: '-0.084px' }}>{km}</p>
      <span style={{ width: 1, height: 12, background: '#d7dadf', flexShrink: 0 }} />
      <UserIcon />
      <p style={{ ...FF, fontSize: 13, fontWeight: 400, color: '#808c9f', letterSpacing: '-0.084px' }}>{rider}</p>
    </div>
  )
}

function DefaultSheet({ onOppsOpen, chartRef, preferencesVisited }) {
  const country = useCountry()
  const title = preferencesVisited ? 'Steady demand in your area' : country.demand.peakOfferTitle
  const bars = preferencesVisited ? MEDIUM_DEMAND_BARS : DEMAND_BARS
  const [campaignActive, campaignUpcoming] = country.campaigns.home
  const scheduled = country.campaigns.scheduled

  return (
    <div style={{ padding: '20px 20px 24px' }}>

      {/* Demand */}
      <p style={{ ...FF, fontSize: 32, fontWeight: 400, color: '#191f1c', letterSpacing: '-0.704px', lineHeight: 1.15, marginBottom: 4 }}>
        {title}
      </p>
      <p style={{ ...FF, fontSize: 14, fontWeight: 600, color: '#808c9f', letterSpacing: '-0.084px', marginBottom: 12 }}>
        Peak ends in 2 hours 12 min.
      </p>
      <div ref={chartRef} style={{ background: 'rgba(0,45,30,0.07)', borderRadius: 12, padding: '12px 14px 10px', marginBottom: 20 }}>
        <DemandChart bars={bars} highlightStart={null} highlightEnd={null} highlightColor={null} />
      </div>

      {/* Opportunities header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ ...FF, fontSize: 32, fontWeight: 400, color: '#191f1c', letterSpacing: '-0.704px', lineHeight: 1.15 }}>
          Opportunities
        </p>
        <button
          onClick={onOppsOpen}
          style={{
            width: 48, height: 48, borderRadius: 24, flexShrink: 0,
            background: 'rgba(0,45,30,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <CalendarIcon />
        </button>
      </div>

      {/* Campaigns */}
      <p style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#2f313f', letterSpacing: '-0.34px', marginTop: 12, marginBottom: 8 }}>
        Campaigns
      </p>
      <CampaignCard campaign={campaignActive} style={{ marginBottom: 8 }} />
      <CampaignCard campaign={campaignUpcoming} style={{ marginBottom: 20 }} />

      {/* Scheduled rides */}
      <p style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#2f313f', letterSpacing: '-0.34px', marginBottom: 8 }}>
        Scheduled rides
      </p>
      <div style={{ background: 'rgba(73,93,122,0.08)', borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ ...FF, fontSize: 13, fontWeight: 600, color: '#fff', background: '#414a55', borderRadius: 4, padding: '3px 8px', letterSpacing: '-0.1px' }}>
            Pick-up at {scheduled.pickup}
          </span>
          <ChevronRightIcon />
        </div>
        <p style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#2a313c', letterSpacing: '-0.34px', marginBottom: 6 }}>
          {scheduled.address}
        </p>
        <ScheduledRideMeta km={scheduled.km} rider={scheduled.rider} />
        <p style={{ ...FF, fontSize: 13, fontWeight: 400, color: '#808c9f', letterSpacing: '-0.084px' }}>
          You can start driving at {scheduled.canStart}.
        </p>
      </div>
      <button style={{
        width: '100%', height: 44, borderRadius: 22,
        border: '1.5px solid #d7dadf', background: 'transparent',
        ...FF, fontSize: 14, fontWeight: 600, color: '#2f313f',
        letterSpacing: '-0.14px', marginBottom: 20,
      }}>
        Schedule more rides (45 available)
      </button>

      {/* Airport demand */}
      <p style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#2f313f', letterSpacing: '-0.34px', marginBottom: 8 }}>
        Airport demand
      </p>
      <AirportChart />
    </div>
  )
}

// ─── Opportunities overlay sheet ─────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const DEMAND_BY_DAY = [
  [10,7,5,4,4,5,7,12,22,38,52,62,70,76,72,68,60,55,52,50,48,54,62,72,80,90,95,86,74,67,60,62,66,74,84,90,96,98,92,82,70,58,46,36,28,20,14,9],
  [6,4,3,2,3,5,10,22,42,62,74,78,72,64,54,46,40,36,34,32,30,34,40,50,62,74,82,88,90,85,78,74,78,84,90,92,88,80,68,52,38,26,18,12,8,6,4,3],
  [12,8,6,5,5,8,14,28,50,72,88,96,100,98,92,86,80,76,74,72,70,74,80,88,94,98,100,96,88,80,76,78,82,88,94,98,100,98,90,78,64,50,38,28,20,14,10,7],
  [8,5,4,3,3,4,7,14,24,36,48,56,60,62,58,52,44,38,34,30,28,30,36,46,58,70,80,84,82,76,68,70,74,78,82,86,88,84,74,60,46,32,22,14,10,7,5,4],
  [14,10,8,7,7,9,16,30,52,70,82,88,92,90,84,76,68,62,58,56,54,58,66,76,86,92,94,90,84,80,78,82,86,90,94,96,98,96,88,76,62,48,36,26,18,14,10,7],
  [20,14,10,8,7,8,10,14,18,22,28,34,40,46,50,54,56,58,60,62,64,68,74,80,86,90,88,82,74,66,60,62,66,72,78,82,80,72,62,50,38,28,20,14,10,8,6,5],
  [22,16,12,9,8,8,10,14,18,22,26,30,34,36,36,34,30,28,26,24,22,20,22,26,30,34,38,40,38,34,28,26,28,30,34,36,34,30,26,22,18,14,10,8,6,5,4,3],
]

function XCircleIcon() {
  return (
    <span style={{
      width: 28,
      height: 28,
      borderRadius: 14,
      background: '#2a313c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
    }}>
      <Clear size="xs" />
    </span>
  )
}

function OpportunitiesSheet({ sheetTop, isDragging, onDragStart, onClose, oppsBarIdx, onBarIdx, oppsDay, onDayChange }) {
  const country = useCountry()
  const day = country.campaigns.dayContent[oppsDay]

  const tH = Math.max(0, CONTENT_STOP - sheetTop)

  return (
    <div style={{
      position: 'absolute',
      top: sheetTop, bottom: 0, left: 0, right: 0,
      background: '#fff',
      borderRadius: sheetTop < 20 ? 0 : '24px 24px 0 0',
      boxShadow: sheetTop < 1000 ? '0px -4px 12px 0px rgba(0,0,0,0.15)' : 'none',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      transition: isDragging ? 'none' : 'top 0.32s cubic-bezier(0.4,0,0.2,1)',
      // Above the home sheet but under the FAB row, so the header buttons and
      // earnings island stay on top exactly as they do over the home sheet.
      zIndex: 6,
      pointerEvents: sheetTop > 900 ? 'none' : 'auto',
    }}>

      {/* Drag handle */}
      <div
        style={{ flexShrink: 0, padding: '10px 0 4px', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
      >
        <div style={{ width: 60, height: 6, background: 'rgba(0,0,0,0.10)', borderRadius: 10, margin: '0 auto' }} />
      </div>

      {/* Spacer: pins content below the FAB row when the sheet goes fullscreen */}
      <div
        style={{ flexShrink: 0, height: tH, transition: isDragging ? 'none' : 'height 0.32s cubic-bezier(0.4,0,0.2,1)' }}
        onMouseDown={tH > 0 ? onDragStart : undefined}
        onTouchStart={tH > 0 ? onDragStart : undefined}
      />

      <div style={{
        flex: 1,
        overflowY: sheetTop <= EXPANDED_TOP + 10 && !isDragging ? 'auto' : 'hidden',
        overflowX: 'hidden',
        paddingBottom: FOOTER_H,
      }}>
        <div style={{ padding: '4px 24px 24px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ ...FF, fontSize: 32, fontWeight: 400, color: '#191f1c', letterSpacing: '-0.704px', lineHeight: '40px' }}>
              Opportunities
            </p>
            <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircleIcon />
            </button>
          </div>

          {/* Day strip — pins to the top of the scroller, which sits just below
              the FAB row when the sheet is fullscreen. Negative margins let the
              opaque backing span the full width while keeping content aligned. */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            margin: '0 -24px 24px',
            padding: '8px 24px 12px',
            background: '#fff',
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {DAYS.map((d, i) => (
                <button
                  key={d}
                  onClick={() => onDayChange(i)}
                  style={{
                    flex: 1, height: 44, borderRadius: 12,
                    background: oppsDay === i ? '#0e1010' : 'rgba(73,93,122,0.08)',
                    ...FF, fontSize: 14,
                    fontWeight: oppsDay === i ? 600 : 400,
                    color: oppsDay === i ? '#fff' : '#2a313c',
                    letterSpacing: '-0.084px',
                  }}
                >{d}</button>
              ))}
            </div>
          </div>

          {/* Demand forecast */}
          <p style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#191f1c', letterSpacing: '-0.34px', marginBottom: 8 }}>Demand forecast</p>
          <div style={{ background: 'rgba(0,45,30,0.07)', borderRadius: 12, padding: '12px 14px 10px', marginBottom: 24 }}>
            <DemandChart
              highlightStart={null} highlightEnd={null} highlightColor={null}
              bars={DEMAND_BY_DAY[oppsDay]}
              selectedBarIdx={oppsBarIdx}
              onBarClick={onBarIdx}
            />
          </div>

          {/* Campaigns */}
          <p style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#191f1c', letterSpacing: '-0.34px', marginBottom: 8 }}>Campaigns</p>
          {day.campaigns.length === 0 ? (
            <div style={{ background: 'rgba(73,93,122,0.08)', border: '1px solid #ebedef', borderRadius: 16, padding: '16px 24px', marginBottom: 24 }}>
              <p style={{ ...FF, fontSize: 14, fontWeight: 400, color: '#808c9f' }}>No active campaigns this day.</p>
            </div>
          ) : (
            <div style={{ marginBottom: 24 }}>
              {day.campaigns.map((c, ci) => (
                <CampaignCard
                  key={ci}
                  campaign={c}
                  style={{
                    padding: '16px 24px',
                    marginBottom: ci < day.campaigns.length - 1 ? 8 : 0,
                  }}
                />
              ))}
            </div>
          )}

          {/* Scheduled rides */}
          <p style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#191f1c', letterSpacing: '-0.34px', marginBottom: 8 }}>Scheduled rides</p>
          {day.rides.length === 0 ? (
            <div style={{ background: 'rgba(73,93,122,0.08)', borderRadius: 12, padding: '12px 16px', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <p style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#2a313c', letterSpacing: '-0.34px' }}>Plan a scheduled ride</p>
                <ChevronRightIcon />
              </div>
              <p style={{ ...FF, fontSize: 14, fontWeight: 400, color: '#808c9f' }}>{day.moreRides} scheduled rides available</p>
            </div>
          ) : (
            <>
              {day.rides.map((r, ri) => (
                <div key={ri} style={{ background: 'rgba(73,93,122,0.08)', borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ ...FF, fontSize: 13, fontWeight: 600, color: '#fff', background: '#414a55', borderRadius: 4, padding: '3px 8px' }}>
                      Pick-up at {r.pickup}
                    </span>
                    <ChevronRightIcon />
                  </div>
                  <p style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#2a313c', letterSpacing: '-0.34px', marginBottom: 6 }}>{r.address}</p>
                  <ScheduledRideMeta km={r.km} rider={r.rider} />
                  <div style={{ height: 1, background: '#ebedef', marginBottom: 8, marginTop: 2 }} />
                  <p style={{ ...FF, fontSize: 14, fontWeight: 400, color: '#808c9f' }}>You can start driving at {r.canStart}.</p>
                </div>
              ))}
              <button style={{
                width: '100%', height: 44, borderRadius: 22,
                border: '1.5px solid #d7dadf', background: 'transparent',
                ...FF, fontSize: 14, fontWeight: 600, color: '#2f313f',
                letterSpacing: '-0.14px', marginBottom: 24,
              }}>
                Schedule more rides ({day.moreRides} available)
              </button>
            </>
          )}

          {/* Airport demand */}
          <p style={{ ...FF, fontSize: 20, fontWeight: 600, color: '#191f1c', letterSpacing: '-0.34px', marginBottom: 8 }}>Airport demand</p>
          <AirportChart />
        </div>
      </div>
    </div>
  )
}

function ZoneSheet({ zone, onClose, chartRef }) {
  return (
    <div style={{ padding: '20px 24px 16px', position: 'relative' }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 20,
          width: 32, height: 32, borderRadius: 16,
          background: 'var(--neutral-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Clear size="xs" style={{ color: 'var(--content-primary)' }} />
      </button>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: zone.color + '1a',
        borderRadius: 8, padding: '4px 10px', marginBottom: 10,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: zone.color, flexShrink: 0 }} />
        <span style={{
          fontSize: 12, fontWeight: 700,
          color: zone.color, fontFamily: 'var(--font-sans)',
          letterSpacing: '-0.084px',
        }}>{zone.level} · {zone.name}</span>
      </div>

      <p style={{
        fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
        fontSize: 28, fontWeight: 600,
        color: 'var(--content-primary-light)',
        letterSpacing: '-0.616px', lineHeight: '36px', marginBottom: 4,
      }}>
        Earn {zone.bonus} per ride
      </p>
      <p style={{
        fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 400,
        color: 'var(--content-secondary)',
        letterSpacing: '-0.084px', lineHeight: '18px', marginBottom: 16,
      }}>
        {zone.subtitle}
      </p>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'var(--neutral-secondary)',
        borderRadius: 8, padding: '5px 10px', marginBottom: 12,
      }}>
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: 'var(--content-secondary-solid)', fontFamily: 'var(--font-sans)',
        }}>{zone.peakLabel}</span>
        <span style={{
          fontSize: 12, fontWeight: 700,
          color: zone.color, fontFamily: 'var(--font-sans)',
        }}>{zone.bonus} Surge</span>
      </div>

      <div ref={chartRef}>
        <DemandChart
          highlightStart={zone.peakStart}
          highlightEnd={zone.peakEnd}
          highlightColor={zone.color}
        />
      </div>
    </div>
  )
}

function DemandChart({ highlightStart, highlightEnd, highlightColor, neutral = false, bars = DEMAND_BARS, selectedBarIdx = null, onBarClick = null }) {
  const maxVal = Math.max(...bars)
  return (
    <>
      <div
        style={{ height: 72, display: 'flex', alignItems: 'flex-end', gap: 2, position: 'relative', cursor: onBarClick ? 'pointer' : 'default' }}
        onClick={onBarClick ? (e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const idx = Math.floor((e.clientX - rect.left) / rect.width * bars.length)
          onBarClick(Math.max(0, Math.min(bars.length - 1, idx)))
        } : undefined}
      >
        {selectedBarIdx !== null && (
          <div style={{
            position: 'absolute', top: 0, bottom: 0, pointerEvents: 'none',
            left: `${(selectedBarIdx / bars.length) * 100}%`,
            width: `${(1 / bars.length) * 100}%`,
            background: 'rgba(52,209,134,0.18)',
            borderRadius: '3px 3px 0 0',
          }} />
        )}
        {bars.map((v, i) => {
          const isPast = i < NOW_IDX
          const isPeak = highlightStart !== null && i >= highlightStart && i <= highlightEnd
          const isSelected = selectedBarIdx === i
          let color
          if (isSelected) {
            color = '#34D186'
          } else if (neutral) {
            color = '#d7dadf'
          } else if (isPast) {
            color = 'var(--inactive)'
          } else if (isPeak) {
            color = highlightColor
          } else if (highlightStart === null) {
            if (v >= 80) color = 'var(--warning)'
            else if (v >= 50) color = 'var(--green)'
            else color = 'rgba(73,93,122,0.16)'
          } else {
            color = 'rgba(73,93,122,0.16)'
          }
          return (
            <div key={i} style={{
              flex: 1, position: 'relative',
              height: `${(v / maxVal) * 100}%`,
              background: color,
              borderRadius: '2px 2px 0 0',
              minHeight: 3,
              opacity: isSelected ? 1 : (isPast && !neutral ? 0.45 : 1),
            }}>
              {isSelected && (
                <div style={{
                  position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#34D186', border: '1.5px solid #fff',
                  boxShadow: '0 0 0 1px #34D186',
                }} />
              )}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {['12 AM', '6 AM', '12 PM', '6 PM', 'Now'].map(t => (
          <span key={t} style={{
            fontSize: 10, fontWeight: 600,
            color: 'var(--content-secondary-solid)', fontFamily: 'var(--font-sans)',
          }}>{t}</span>
        ))}
      </div>
    </>
  )
}

// ─── Main screen ──────────────────────────────────────────────────

const FULLSCREEN_TOP = 0
const EXPANDED_TOP = 450
const COLLAPSED_TOP = 628
// Sticky area: 20px padding + 72px buttons + 20px padding.
const FOOTER_H = 112
// FAB row: top 44, height 48 → bottom 92. Content stops 24px below that.
const CONTENT_STOP = 75
// Breathing room under the demand chart in the collapsed state.
const CHART_BOTTOM_GAP = 12
// Never let the collapsed sheet swallow the map entirely on very short screens.
const MIN_COLLAPSED_TOP = 160

export default function HomeScreen({ navigate, sidebarPhase, fabRef, hubFabRef, isHubOpen, hasTasks, hubBadge = 2, preferencesVisited = false }) {
  const country = useCountry()
  const {
    center: mapCenter,
    driverPos,
    overviewZoom,
    zoneZoom,
    clusters: clusterZones,
    individuals: individualZones,
    driverAreaIds,
  } = country.map
  const [selectedZone, setSelectedZone] = useState(null)
  const [earningsOpen, setEarningsOpen] = useState(false)
  const [oppsOpen, setOppsOpen] = useState(false)
  const [mapZoom, setMapZoom] = useState(overviewZoom)
  const drag = useRef({ active: false, startY: 0, startTop: 0, currentTop: EXPANDED_TOP })
  const screenRef = useRef(null)
  const sheetScrollRef = useRef(null)
  const sheetHandleRef = useRef(null)
  const chartRef = useRef(null)
  // Tracks a fullscreen content gesture until we know whether it's a scroll
  // or a pull-to-collapse at the top.
  const pullCollapse = useRef({ armed: false, startY: 0, startScrollTop: 0 })

  // Snap points are named rather than fixed pixels so the collapsed height can
  // be measured from real content and re-derived when the viewport changes.
  const [snap, setSnap] = useState('expanded')
  const [dragTop, setDragTop] = useState(null)
  const [collapsedTop, setCollapsedTop] = useState(COLLAPSED_TOP)
  // On short screens the measured collapsed point can rise above the default
  // mid point; keep the ordering fullscreen ≤ expanded ≤ collapsed.
  const expandedTop = Math.min(EXPANDED_TOP, collapsedTop)
  const snapTops = { fullscreen: FULLSCREEN_TOP, expanded: expandedTop, collapsed: collapsedTop }

  const isDragging = dragTop !== null
  const sheetTop = isDragging ? dragTop : snapTops[snap]
  // Scroll is locked until the sheet is fully open — a swipe on a mid/collapsed
  // sheet expands it instead of scrolling content underneath.
  const isFullscreen = sheetTop <= FULLSCREEN_TOP + 10

  // Size the collapsed state so the demand chart clears the footer on any
  // screen. Measured relative to the scroller, so it holds mid-transition.
  useLayoutEffect(() => {
    const measure = () => {
      const screenEl = screenRef.current
      const scroller = sheetScrollRef.current
      const handleEl = sheetHandleRef.current
      const chartEl = chartRef.current
      if (!screenEl || !scroller || !handleEl || !chartEl) return
      const chartBottom =
        chartEl.getBoundingClientRect().bottom -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop
      const needed = handleEl.offsetHeight + chartBottom + CHART_BOTTOM_GAP
      setCollapsedTop(
        Math.max(MIN_COLLAPSED_TOP, Math.round(screenEl.clientHeight - FOOTER_H - needed)),
      )
    }

    measure()
    const observer = new ResizeObserver(measure)
    if (screenRef.current) observer.observe(screenRef.current)
    if (chartRef.current) observer.observe(chartRef.current)
    return () => observer.disconnect()
  }, [selectedZone])

  const [oppsSheetTop, setOppsSheetTop] = useState(1100)
  const [isOppsDragging, setIsOppsDragging] = useState(false)
  const oppsDrag = useRef({ active: false, startY: 0, startTop: 0 })
  const [oppsBarIdx, setOppsBarIdx] = useState(NOW_IDX)
  const [oppsDay, setOppsDay] = useState(0)

  const openOpps = () => {
    setOppsSheetTop(FULLSCREEN_TOP)
    setOppsBarIdx(NOW_IDX)
    setOppsDay(0)
    setOppsOpen(true)
  }

  const closeOpps = () => {
    setOppsSheetTop(1100)
    setOppsOpen(false)
  }

  const snapTo = (name) => {
    if (name !== 'fullscreen' && sheetScrollRef.current) {
      sheetScrollRef.current.scrollTop = 0
    }
    setSnap(name)
    setDragTop(null)
  }

  const handleZoneSelect = (zone) => {
    const next = selectedZone?.id === zone.id ? null : zone
    setSelectedZone(next)
    snapTo(next ? 'collapsed' : 'expanded')
  }

  const handleDeselect = () => {
    setSelectedZone(null)
    snapTo('expanded')
  }

  const onDragStart = (e) => {
    const y = e.touches?.[0]?.clientY ?? e.clientY
    drag.current = { active: true, startY: y, startTop: sheetTop, currentTop: sheetTop }
    setDragTop(sheetTop)
  }

  const onSheetBodyDragStart = (e) => {
    if (e.target.closest?.('button, a, input, textarea, select, [role="button"]')) return
    // Mid/collapsed: any body swipe expands/collapses the sheet.
    // Fullscreen: only start a sheet drag when already at scroll top (pull-to-collapse);
    // otherwise let the scroller handle the gesture.
    if (isFullscreen) {
      if ((sheetScrollRef.current?.scrollTop ?? 0) > 0) return
      const y = e.touches?.[0]?.clientY ?? e.clientY
      pullCollapse.current = {
        armed: true,
        startY: y,
        startScrollTop: sheetScrollRef.current?.scrollTop ?? 0,
      }
      return
    }
    onDragStart(e)
  }

  const maybeBeginPullCollapse = (y, scrollTop) => {
    const g = pullCollapse.current
    if (!g.armed || drag.current.active) return false
    const dy = y - g.startY
    // At top + pulling down → hand off to the sheet drag.
    if (g.startScrollTop <= 0 && scrollTop <= 0 && dy > 6) {
      g.armed = false
      drag.current = {
        active: true,
        startY: y,
        startTop: FULLSCREEN_TOP,
        currentTop: FULLSCREEN_TOP,
      }
      if (sheetScrollRef.current) sheetScrollRef.current.scrollTop = 0
      setDragTop(FULLSCREEN_TOP)
      return true
    }
    // Moved up or enough that this is a normal scroll — stop watching.
    if (dy < -6 || scrollTop > 0) g.armed = false
    return false
  }

  const onDragMove = (e) => {
    const y = e.touches?.[0]?.clientY ?? e.clientY
    if (!drag.current.active) {
      maybeBeginPullCollapse(y, sheetScrollRef.current?.scrollTop ?? 0)
      if (!drag.current.active) return
    }
    const next = Math.max(FULLSCREEN_TOP, Math.min(collapsedTop, drag.current.startTop + (y - drag.current.startY)))
    drag.current.currentTop = next
    setDragTop(next)
  }

  const onDragEnd = () => {
    pullCollapse.current.armed = false
    if (!drag.current.active) return
    const startTop = drag.current.startTop
    const currentTop = drag.current.currentTop
    drag.current.active = false

    const dy = currentTop - startTop
    const midpoint = (expandedTop + collapsedTop) / 2

    // From mid/collapsed, an upward swipe always opens fullscreen first —
    // content scroll is locked until that state. Downward keeps the usual
    // expanded ↔ collapsed snap.
    if (startTop > FULLSCREEN_TOP + 10) {
      if (dy < -24) {
        snapTo('fullscreen')
      } else if (dy > 24 || currentTop >= midpoint) {
        snapTo('collapsed')
      } else {
        snapTo('expanded')
      }
      return
    }

    // From fullscreen: any meaningful pull down returns to the initial
    // (expanded) state; pull further to reach the collapsed peek.
    if (dy > 24) {
      snapTo(currentTop >= midpoint ? 'collapsed' : 'expanded')
    } else {
      snapTo('fullscreen')
    }
  }

  const onDragMoveRef = useRef(onDragMove)
  const onDragEndRef = useRef(onDragEnd)
  const maybeBeginPullCollapseRef = useRef(maybeBeginPullCollapse)
  const isFullscreenRef = useRef(isFullscreen)
  onDragMoveRef.current = onDragMove
  onDragEndRef.current = onDragEnd
  maybeBeginPullCollapseRef.current = maybeBeginPullCollapse
  isFullscreenRef.current = isFullscreen

  // Non-passive touchmove so we can preventDefault when pull-to-collapse
  // takes over — otherwise the browser keeps rubber-banding the scroller.
  // Listeners stay mounted for the scroller's lifetime so a mid-drag
  // fullscreen→expanded transition doesn't detach them.
  useEffect(() => {
    const el = sheetScrollRef.current
    if (!el) return undefined

    const onTouchStart = (e) => {
      if (!isFullscreenRef.current || drag.current.active) return
      if (e.target.closest?.('button, a, input, textarea, select, [role="button"]')) return
      pullCollapse.current = {
        armed: true,
        startY: e.touches[0].clientY,
        startScrollTop: el.scrollTop,
      }
    }

    const onTouchMove = (e) => {
      if (drag.current.active) {
        e.preventDefault()
        onDragMoveRef.current(e)
        return
      }
      if (!pullCollapse.current.armed) return
      if (maybeBeginPullCollapseRef.current(e.touches[0].clientY, el.scrollTop)) {
        e.preventDefault()
      }
    }

    const onTouchEnd = () => {
      if (drag.current.active) onDragEndRef.current()
      else pullCollapse.current.armed = false
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [])

  const onOppsDragStart = (e) => {
    const y = e.touches?.[0]?.clientY ?? e.clientY
    oppsDrag.current = { active: true, startY: y, startTop: oppsSheetTop }
    setIsOppsDragging(true)
  }

  const onOppsDragMove = (e) => {
    if (!oppsDrag.current.active) return
    const y = e.touches?.[0]?.clientY ?? e.clientY
    const next = Math.max(FULLSCREEN_TOP, Math.min(COLLAPSED_TOP, oppsDrag.current.startTop + (y - oppsDrag.current.startY)))
    setOppsSheetTop(next)
  }

  const onOppsDragEnd = () => {
    if (!oppsDrag.current.active) return
    oppsDrag.current.active = false
    setIsOppsDragging(false)
    if (oppsSheetTop > (EXPANDED_TOP + COLLAPSED_TOP) / 2) {
      closeOpps()
    } else if (oppsSheetTop < (FULLSCREEN_TOP + EXPANDED_TOP) / 2) {
      setOppsSheetTop(FULLSCREEN_TOP)
    } else {
      setOppsSheetTop(EXPANDED_TOP)
    }
  }

  return (
    <div
      ref={screenRef}
      className="screen"
      style={{ background: '#e9eaee' }}
      onMouseMove={(e) => oppsDrag.current.active ? onOppsDragMove(e) : onDragMove(e)}
      onMouseUp={() => oppsDrag.current.active ? onOppsDragEnd() : onDragEnd()}
      onTouchMove={(e) => oppsDrag.current.active ? onOppsDragMove(e) : onDragMove(e)}
      onTouchEnd={() => oppsDrag.current.active ? onOppsDragEnd() : onDragEnd()}
    >

      {/* Map */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <MapContainer
          key={country.slug}
          center={mapCenter}
          zoom={overviewZoom}
          zoomControl={false}
          attributionControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          <MapController
            selectedZone={selectedZone}
            mapCenter={mapCenter}
            overviewZoom={overviewZoom}
            zoneZoom={zoneZoom}
          />
          <MapClickHandler onDeselect={handleDeselect} />
          <ZoomWatcher onChange={setMapZoom} />
          {(() => {
            const dayBars = DEMAND_BY_DAY[oppsDay]
            const maxDayBar = Math.max(...dayBars)
            const normalizedDemand = oppsOpen ? dayBars[oppsBarIdx] / maxDayBar : 0
            const visibleClusters = preferencesVisited
              ? clusterZones.filter((zone) => !driverAreaIds.has(zone.id))
              : clusterZones
            const visibleIndividuals = preferencesVisited
              ? individualZones.filter((zone) => !driverAreaIds.has(zone.id))
              : individualZones
            return oppsOpen ? (
              visibleIndividuals.map((zone) => (
                <AnimatedSurgeLayer
                  key={zone.id}
                  zone={zone}
                  visible={false}
                  selected={false}
                  onSelect={() => {}}
                  small
                  heatmapActivity={getZoneActivity(zone, oppsBarIdx, normalizedDemand)}
                />
              ))
            ) : (
              <>
                {visibleClusters.map((zone) => (
                  <AnimatedSurgeLayer
                    key={zone.id}
                    zone={zone}
                    visible={mapZoom < 13}
                    selected={selectedZone?.id === zone.id}
                    onSelect={() => handleZoneSelect(zone)}
                    small={false}
                  />
                ))}
                {visibleIndividuals.map((zone) => (
                  <AnimatedSurgeLayer
                    key={zone.id}
                    zone={zone}
                    visible={mapZoom >= 13}
                    selected={selectedZone?.id === zone.id}
                    onSelect={() => handleZoneSelect(zone)}
                    small
                  />
                ))}
              </>
            )
          })()}
          <Marker position={driverPos} icon={makeCarIcon()} interactive={false} />
        </MapContainer>
      </div>

      {/* Notification card */}
      {hasTasks && (
        <div style={{
          position: 'absolute', top: 108, left: '50%', transform: 'translateX(-50%)',
          width: 341, zIndex: 8,
          background: '#0e1010', borderRadius: 24,
          boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
          padding: '32px 24px 24px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ ...FF, fontSize: 32, fontWeight: 600, color: 'rgba(253,255,254,0.93)', letterSpacing: '-0.704px', lineHeight: '40px' }}>
              Your driving license has expired
            </p>
            <p style={{ ...FF, fontSize: 16, fontWeight: 400, color: 'rgba(253,255,254,0.93)', letterSpacing: '-0.176px', lineHeight: '24px' }}>
              Upload a new driving license to keep driving
            </p>
          </div>
          <button style={{
            ...FF, alignSelf: 'flex-start',
            background: '#fff', color: '#191f1c',
            fontSize: 16, fontWeight: 600, letterSpacing: '-0.176px', lineHeight: '24px',
            minHeight: 48, paddingLeft: 20, paddingRight: 20,
            borderRadius: 9600,
          }}>
            Upload
          </button>
        </div>
      )}

      {/* Header FABs */}
      <div style={{
        position: 'absolute', top: 44, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 59,
        zIndex: 10,
      }}>
        <button ref={fabRef} className="fab fab-profile" onClick={() => navigate('sidebar')} style={{
          overflow: 'hidden', padding: 0,
          opacity: sidebarPhase !== 'closed' ? 0 : earningsOpen ? 0.6 : 1,
          transform: earningsOpen ? 'translateX(-8px)' : 'translateX(0)',
          transition: sidebarPhase === 'closed' ? 'opacity 0.15s, transform 0.3s cubic-bezier(0.34,1.08,0.64,1)' : 'none',
        }}>
          <img src={country.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </button>
        <div style={{ width: 113, height: 48, flexShrink: 0 }} />
        <button ref={hubFabRef} className="fab" style={{ position: 'relative', transform: earningsOpen ? 'translateX(8px)' : 'translateX(0)', opacity: isHubOpen ? 0 : 1, transition: 'opacity 0.15s, transform 0.3s cubic-bezier(0.34,1.08,0.64,1)' }} onClick={() => navigate('bolt-hub')}>
          <Inbox size="lg" style={{ color: 'var(--content-primary)' }} aria-hidden="true" />
          <div style={{
            position: 'absolute', top: -2, right: -2,
            minWidth: 20, height: 20, borderRadius: 9600,
            background: '#191f1c', border: '2px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-sans)',
            paddingLeft: 4, paddingRight: 4,
          }}>{hubBadge}</div>
        </button>
      </div>

      {/* Bottom sheet */}
      <div style={{
        position: 'absolute',
        top: sheetTop,
        bottom: 0, left: 0, right: 0,
        background: '#fff',
        borderRadius: sheetTop < 20 ? 0 : '24px 24px 0 0',
        boxShadow: '0px -4px 12px 0px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: isDragging ? 'none' : 'top 0.32s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 5,
      }}>
        <div
          ref={sheetHandleRef}
          style={{ flexShrink: 0, padding: '10px 0 4px', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
        >
          <div style={{ width: 60, height: 6, background: 'rgba(0,0,0,0.10)', borderRadius: 10, margin: '0 auto' }} />
        </div>

        {/* Spacer: pins content to EXPANDED_TOP regardless of how far the sheet slides up */}
        <div style={{
          flexShrink: 0,
          height: Math.max(0, CONTENT_STOP - sheetTop),
          transition: isDragging ? 'none' : 'height 0.32s cubic-bezier(0.4,0,0.2,1)',
        }} />

        <div
          ref={sheetScrollRef}
          style={{
            flex: 1,
            overflowY: isFullscreen && !isDragging ? 'auto' : 'hidden',
            overflowX: 'hidden',
            paddingBottom: FOOTER_H,
            // When not fullscreen, hand the gesture to the sheet drag so the
            // browser can't start a scroll that never unlocks.
            touchAction: isFullscreen ? 'pan-y' : 'none',
            overscrollBehavior: 'contain',
          }}
          onMouseDown={onSheetBodyDragStart}
          onTouchStart={isFullscreen ? undefined : onSheetBodyDragStart}
        >
          {selectedZone
            ? <ZoneSheet zone={selectedZone} onClose={handleDeselect} chartRef={chartRef} />
            : <DefaultSheet onOppsOpen={openOpps} chartRef={chartRef} preferencesVisited={preferencesVisited} />
          }
        </div>
      </div>

      <EarningsIsland onOpenChange={setEarningsOpen} />

      <OpportunitiesSheet
        sheetTop={oppsSheetTop}
        isDragging={isOppsDragging}
        onDragStart={onOppsDragStart}
        onClose={closeOpps}
        oppsBarIdx={oppsBarIdx}
        onBarIdx={setOppsBarIdx}
        oppsDay={oppsDay}
        onDayChange={setOppsDay}
      />

      {/* Sticky area (Figma 441:21128) */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
        zIndex: 20,
        background: 'linear-gradient(to top, #fff 80%, rgba(255,255,255,0) 100%)',
      }}>
        <button
          style={{
            flex: 1, height: 72, borderRadius: 100,
            background: '#000',
            color: '#fff',
            fontFamily: 'var(--font-sans)', fontFeatureSettings: 'var(--ffs)',
            fontSize: 24, fontWeight: 600,
            letterSpacing: '-0.48px', lineHeight: '30px',
          }}
        >
          Go online
        </button>
        <button
          aria-label="Preferences"
          style={{
            width: 72, height: 72, borderRadius: 100,
            background: '#fff',
            boxShadow: '0px 4px 12px 0px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
          onClick={() => navigate('preferences')}
        >
          {/* Figma sizes this glyph 32px, between Kalep's lg (24) and xl (36). */}
          <Filters size="lg" width={32} height={32} style={{ color: 'var(--content-primary)' }} />
        </button>
      </div>
    </div>
  )
}
