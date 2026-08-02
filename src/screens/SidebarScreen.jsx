import { useState } from 'react'
import {
  Alert,
  Badge,
  GhostButton,
  ListItemLayout,
  Tabs,
  TypographyStack,
} from '@ui'
import {
  Alert as AlertIcon,
  Business,
  Check,
  ChevronRight,
  Clear,
  DoubleCheck,
  Settings,
  Star,
} from '@icons'
import TierRewardsIcon from '../components/profile/TierRewardsIcon.jsx'
import RewardsPanel from '../components/profile/RewardsPanel.jsx'
import SlidingTabPanels from '../components/SlidingTabPanels.jsx'
import profilePhoto from '../assets/profile/avatar.png'
import { useCountry } from '../context/CountryContext.jsx'
import { AT_RISK_ACTIONS, METRICS, PROFILE } from '../data/profile.js'

/** Chart accent from Figma rating sparkline (warning amber) */
const RATING_CHART_STROKE = '#FFB200'

function RatingChart() {
  return (
    <div className="relative h-10 w-[121px] shrink-0 overflow-clip" aria-hidden="true">
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 121 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {[0.25, 30.25, 60.5, 90.75, 120.75].map((x) => (
          <line
            key={`v-${x}`}
            x1={x}
            y1="0"
            x2={x}
            y2="40"
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="0.5"
            className="text-primary"
          />
        ))}
        {[0.25, 13.5, 26.75, 39.75].map((y) => (
          <line
            key={`h-${y}`}
            x1="0"
            y1={y}
            x2="121"
            y2={y}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="0.5"
            className="text-primary"
          />
        ))}
        <path
          d="M5.5 4C54.5 4 38.2 34.4 119.8 34.4"
          stroke={RATING_CHART_STROKE}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {/* End-cap matches Figma content/warning-primary (#9E5B00) + floor fill */}
      <span
        className="absolute bottom-px right-[-1px] size-2 rounded-full"
        style={{ backgroundColor: '#9E5B00' }}
      />
      <span className="absolute bottom-[3px] right-0.5 size-1 rounded-full bg-layer-floor-1" />
    </div>
  )
}

function MetricBadge({ badge }) {
  const icon =
    badge.icon === 'alert' ? (
      <AlertIcon />
    ) : badge.icon === 'double-check' ? (
      <DoubleCheck />
    ) : (
      <Check />
    )

  return (
    <Badge variant={badge.variant} size="xs" type="pill">
      <Badge.Icon icon={icon} />
      <Badge.Content>{badge.label}</Badge.Content>
    </Badge>
  )
}

function StarRatingCard() {
  const metric = METRICS.rating

  return (
    <button
      type="button"
      className="flex h-[88px] w-full flex-col gap-2 rounded-[12px] bg-neutral-secondary px-4 py-3 text-left"
    >
      <div className="flex w-full flex-col gap-1 rounded-[8px]">
        <div className="flex w-full items-start justify-between">
          <span className="bolt-font-body-s text-primary">{metric.label}</span>
          <ChevronRight size="sm" className="shrink-0 text-primary" aria-hidden="true" />
        </div>
        <div className="flex h-10 w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star size="lg" className="shrink-0 text-primary" aria-hidden="true" />
              <span className="bolt-font-heading-m-accent whitespace-nowrap text-primary">
                {metric.value}
              </span>
            </div>
            <MetricBadge badge={metric.badge} />
          </div>
          <RatingChart />
        </div>
      </div>
    </button>
  )
}

function CompactMetricCard({ metric }) {
  return (
    <button
      type="button"
      className="flex min-w-0 flex-1 flex-col gap-1 rounded-[12px] bg-neutral-secondary px-4 py-3 text-left"
    >
      <div className="flex w-full flex-col gap-1 rounded-[8px]">
        <div className="flex w-full items-start justify-between">
          <span className="bolt-font-body-s text-primary">{metric.label}</span>
          <ChevronRight size="sm" className="shrink-0 text-primary" aria-hidden="true" />
        </div>
        <div className="flex w-full flex-col gap-0.5">
          <span className="bolt-font-heading-m-accent text-primary">{metric.value}</span>
        </div>
      </div>
      <MetricBadge badge={metric.badge} />
    </button>
  )
}

function AtRiskRow({ label, count, variant, separator }) {
  return (
    <div>
      <ListItemLayout.Root className="min-h-8 gap-2 px-4 py-3">
        <ListItemLayout.Content className="min-w-0">
          <TypographyStack>
            <TypographyStack.Primary className="bolt-font-body-m py-0.5 text-primary">
              {label}
            </TypographyStack.Primary>
          </TypographyStack>
        </ListItemLayout.Content>
        <ListItemLayout.Slot className="shrink-0 pl-3">
          <Badge variant={variant} size="xs" type="pill">
            <Badge.Content>{count}</Badge.Content>
          </Badge>
        </ListItemLayout.Slot>
        <ListItemLayout.Slot className="shrink-0 py-0.5 pl-2">
          <ChevronRight size="sm" className="text-primary" aria-hidden="true" />
        </ListItemLayout.Slot>
      </ListItemLayout.Root>
      {separator ? (
        <div className="mx-4 border-0 border-b border-solid border-separator" aria-hidden="true" />
      ) : null}
    </div>
  )
}

function PerformancePanel({ country }) {
  const acceptedMetric = { ...METRICS.accepted, ...country.rates.accepted }
  const cancelledMetric = { ...METRICS.cancelled, ...country.rates.cancelled }

  return (
    <div className="flex w-full flex-col items-center pb-8">
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full flex-col px-6">
          <div className="h-5 w-full" aria-hidden="true" />
          <h2 className="bolt-font-heading-s-accent text-primary">Metrics</h2>
          <div className="h-2 w-full" aria-hidden="true" />
        </div>

        <div className="w-full px-6">
          <Alert.Root severity="warning" className="rounded-[12px]">
            <Alert.Icon />
            <Alert.Content>
              <Alert.Description>Improve your rating to avoid suspension</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </div>

        <div className="flex w-full flex-col gap-2 px-6">
          <StarRatingCard />
          <div className="flex w-full gap-2">
            <CompactMetricCard metric={acceptedMetric} />
            <CompactMetricCard metric={cancelledMetric} />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="flex h-[58px] w-full flex-col px-6">
          <div className="h-5 w-full" aria-hidden="true" />
          <div className="flex w-full items-start gap-2">
            <h3 className="min-w-0 flex-1 bolt-font-heading-s-accent text-primary">At Risk Actions</h3>
            <GhostButton
              size="md"
              className="shrink-0 bolt-font-body-m-compact-accent text-action-primary"
            >
              View all
            </GhostButton>
          </div>
          <div className="h-2 w-full" aria-hidden="true" />
        </div>

        <div className="mx-6 flex flex-col rounded-[12px] bg-neutral-secondary">
          {AT_RISK_ACTIONS.map((action, index) => (
            <AtRiskRow
              key={action.id}
              label={action.label}
              count={action.count}
              variant={action.variant}
              separator={index < AT_RISK_ACTIONS.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SidebarScreen({ goBack }) {
  const country = useCountry()
  const [tab, setTab] = useState('performance')

  function handleSwitchProfile() {
    // Prototype hook — wire to profile picker when available
  }

  return (
    <div className="screen flex flex-col overflow-hidden bg-layer-floor-1">
      <div className="relative h-[213px] w-full shrink-0">
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <button type="button" className="fab" aria-label="Close profile" onClick={goBack}>
            <Clear size="lg" style={{ color: 'var(--content-primary)' }} />
          </button>
          <button type="button" className="fab" aria-label="Profile settings">
            <Settings size="lg" style={{ color: 'var(--content-primary)' }} />
          </button>
        </div>

        <div className="absolute left-1/2 top-4 size-[68px] -translate-x-1/2 overflow-hidden rounded-full">
          <img
            src={profilePhoto}
            alt=""
            className="size-full object-cover"
            draggable={false}
          />
        </div>

        <h1 className="absolute left-1/2 top-24 -translate-x-1/2 whitespace-nowrap bolt-font-heading-xs-accent text-primary">
          {PROFILE.name}
        </h1>

        <div className="absolute left-1/2 top-[129px] flex -translate-x-1/2 items-center gap-2">
          <div className="flex items-center gap-0.5">
            <TierRewardsIcon tier="silver" />
            <span className="bolt-font-body-s whitespace-nowrap text-secondary">{PROFILE.tier}</span>
          </div>
          <span className="bolt-font-body-s text-secondary" aria-hidden="true">
            ·
          </span>
          <button
            type="button"
            onClick={handleSwitchProfile}
            className="flex items-center gap-0.5"
            aria-label="Switch profile"
          >
            <Business size="sm" className="shrink-0 text-secondary" aria-hidden="true" />
            <span className="bolt-font-body-s whitespace-nowrap text-secondary">{PROFILE.fleet}</span>
            <ChevronRight size="sm" className="shrink-0 text-secondary" aria-hidden="true" />
          </button>
        </div>

        <Tabs.Root value={tab} onValueChange={setTab} className="absolute inset-x-0 top-[165px] px-6">
          <Tabs.List className="w-full">
            <Tabs.Tab value="performance" className="flex-1">
              Performance
            </Tabs.Tab>
            <Tabs.Tab value="rewards" className="flex-1">
              Rewards
            </Tabs.Tab>
            <Tabs.Indicator />
          </Tabs.List>
        </Tabs.Root>
      </div>

      <SlidingTabPanels
        activeTab={tab}
        className="min-h-0 flex-1"
        panelClassName="scroll-content h-full"
        tabs={[
          { id: 'performance', content: <PerformancePanel country={country} /> },
          { id: 'rewards', content: <RewardsPanel /> },
        ]}
      />
    </div>
  )
}
