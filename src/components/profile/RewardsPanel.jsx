import { GhostButton } from '@ui'
import { ChevronRight } from '@icons'
import { useCountry } from '../../context/CountryContext.jsx'
import benefitCommission from '../../assets/rewards/benefit-commission.png'
import benefitMap from '../../assets/rewards/benefit-map.png'
import partnerAutotah from '../../assets/rewards/partner-autotah.png'
import partnerCirclek from '../../assets/rewards/partner-circlek.png'
import partnerEestiGaas from '../../assets/rewards/partner-eesti-gaas.png'
import partnerShell from '../../assets/rewards/partner-shell.png'
import progressDot from '../../assets/rewards/progress-dot.svg'
import {
  GOLD_BENEFITS,
  REWARDS_PROGRESS,
  REWARDS_PROGRESS_FILL_RATIO,
  REWARDS_TIER_COLORS,
  SILVER_BENEFITS,
} from '../../data/rewards.js'
import TierRewardsIcon from './TierRewardsIcon.jsx'

const PARTNER_LOGOS = {
  shell: partnerShell,
  circlek: partnerCirclek,
  autotah: partnerAutotah,
  'eesti-gaas': partnerEestiGaas,
}

const BENEFIT_ILLUSTRATIONS = {
  map: benefitMap,
  commission: benefitCommission,
}

/** Figma progress dot center at 129px on 328px track — tooltip uses the same anchor */
const PROGRESS_DOT_LEFT_RATIO = 129 / 328

const MILESTONE_LABEL_POSITIONS = [
  { left: '21px', transform: 'translateX(-100%)', textAlign: 'right' },
  { left: '85.5px', transform: 'translateX(-50%)', textAlign: 'center' },
  { left: '164.5px', transform: 'translateX(-50%)', textAlign: 'center' },
  { left: '241px', transform: 'translateX(-50%)', textAlign: 'center' },
  { left: '315.5px', transform: 'translateX(-50%)', textAlign: 'center' },
]

function RewardsSectionHeader({ title, showViewAll = false }) {
  return (
    <div className="flex w-full flex-col px-6">
      <div className="h-5 w-full" aria-hidden="true" />
      <div className="flex w-full items-start gap-2">
        <h3 className="min-w-0 flex-1 bolt-font-heading-xs-accent text-primary">{title}</h3>
        {showViewAll ? (
          <GhostButton
            size="md"
            className="shrink-0 bolt-font-body-m-compact-accent text-action-primary"
          >
            View all
          </GhostButton>
        ) : null}
      </div>
      <div className="h-2 w-full" aria-hidden="true" />
    </div>
  )
}

function ProgressSection() {
  const { title, subtitle, points, milestones } = REWARDS_PROGRESS

  return (
    <div className="w-full px-6">
      <div className="h-5 w-full" aria-hidden="true" />
      <h2 className="bolt-font-heading-s-accent text-primary">{title}</h2>
      <p className="mt-2 bolt-font-body-m text-primary">{subtitle}</p>

      <div className="relative mt-5 h-[74px] w-full max-w-[327px]">
        <div
          className="absolute top-0 flex flex-col items-center"
          style={{ left: `${PROGRESS_DOT_LEFT_RATIO * 100}%`, transform: 'translateX(-50%)' }}
        >
          <div className="rounded-[8px] bg-active-neutral-primary px-3 py-1.5">
            <span className="bolt-font-body-s-accent whitespace-nowrap text-primary-inverted">
              {points} points
            </span>
          </div>
          <svg
            className="size-3 rotate-180 text-active-neutral-primary"
            viewBox="0 0 12 6"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M0 0L6 6L12 0H0Z" />
          </svg>
        </div>

        <div className="absolute left-0 top-[42px] h-2 w-full max-w-[328px]">
          <div
            className="absolute inset-x-0 top-0.5 h-1 rounded-[10px]"
            style={{ backgroundColor: REWARDS_TIER_COLORS.progressTrack }}
          />
          <div
            className="absolute left-0 top-0.5 h-1 rounded-[10px] bg-secondary"
            style={{ width: `${REWARDS_PROGRESS_FILL_RATIO * 100}%` }}
          />
          <img
            alt=""
            src={progressDot}
            className="absolute top-0 size-2 -translate-x-1/2"
            style={{ left: `${PROGRESS_DOT_LEFT_RATIO * 100}%` }}
          />
        </div>

        <div className="absolute left-0 top-[38px] flex w-full max-w-[327px] items-center justify-between">
          {milestones.map((milestone) => (
            <TierRewardsIcon key={milestone.label} tier={milestone.tier} />
          ))}
        </div>

        <div className="absolute left-0 top-14 h-4 w-full max-w-[327px]">
          {milestones.map((milestone, index) => (
            <span
              key={milestone.label}
              className="absolute top-0 bolt-font-body-xs-regular text-[#2A313C] whitespace-nowrap"
              style={{
                left: MILESTONE_LABEL_POSITIONS[index].left,
                transform: MILESTONE_LABEL_POSITIONS[index].transform,
                textAlign: MILESTONE_LABEL_POSITIONS[index].textAlign,
              }}
            >
              {milestone.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function BenefitCard({ eyebrow, title, backgroundColor, illustrationKey }) {
  return (
    <button
      type="button"
      className="flex w-[282px] shrink-0 flex-col justify-center rounded-[12px] px-4 text-left"
      style={{ backgroundColor }}
    >
      <div className="h-3 w-full" aria-hidden="true" />
      <div className="flex min-h-8 items-center">
        <div className="relative mr-4 size-16 shrink-0">
          <img
            alt=""
            src={BENEFIT_ILLUSTRATIONS[illustrationKey]}
            className="pointer-events-none absolute inset-0 size-full max-w-none object-contain"
            draggable={false}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="bolt-font-body-s text-secondary">{eyebrow}</p>
          <p className="py-0.5 bolt-font-body-m-compact-accent text-primary">{title}</p>
        </div>
        <ChevronRight size="sm" className="ml-2 size-5 shrink-0 text-primary" aria-hidden="true" />
      </div>
      <div className="h-3 w-full" aria-hidden="true" />
    </button>
  )
}

function BenefitCarousel({ benefits, backgroundColor }) {
  return (
    <div className="flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {benefits.map((benefit) => (
        <BenefitCard
          key={benefit.id}
          eyebrow={benefit.eyebrow}
          title={benefit.title}
          backgroundColor={backgroundColor}
          illustrationKey={benefit.illustration}
        />
      ))}
    </div>
  )
}

function DiscountCard({ name, discount, logo }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1 rounded-[12px] bg-neutral-secondary px-4 py-2">
      {logo ? (
        <img
          alt=""
          src={logo}
          className="size-16 shrink-0 object-contain"
          draggable={false}
        />
      ) : (
        <div className="size-16 shrink-0" aria-hidden="true" />
      )}
      <div className="flex flex-col items-center text-center">
        <span className="bolt-font-body-s text-secondary">{name}</span>
        <span className="bolt-font-heading-s-accent text-primary">{discount}</span>
      </div>
    </div>
  )
}

export default function RewardsPanel() {
  const country = useCountry()

  return (
    <div className="flex w-full flex-col pb-8">
      <ProgressSection />

      <div className="px-6 pt-[30px]">
        <p className="bolt-font-heading-s-accent text-primary">
          Enjoy your{' '}
          <TierRewardsIcon tier="silver" size={24} className="mx-0.5 inline-block align-[-4px]" />
          <span style={{ color: REWARDS_TIER_COLORS.silverText }}>silver</span>
          <br />
          rewards
        </p>
      </div>

      <RewardsSectionHeader title="Top benefits" showViewAll />
      <BenefitCarousel benefits={SILVER_BENEFITS} backgroundColor={REWARDS_TIER_COLORS.silverCard} />

      <RewardsSectionHeader title="Top discounts" showViewAll />
      <div className="flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {country.rewardsPartners.map((discount) => (
          <DiscountCard
            key={discount.id}
            name={discount.name}
            discount={discount.discount}
            logo={PARTNER_LOGOS[discount.id]}
          />
        ))}
      </div>

      <div className="px-6 pt-6 pb-4">
        <p className="bolt-font-heading-s-accent text-primary">
          Unlock{' '}
          <TierRewardsIcon tier="gold" size={24} className="mx-0.5 inline-block align-[-4px]" />
          <span style={{ color: REWARDS_TIER_COLORS.goldText }}>golden</span>
          <br />
          rewards
        </p>
      </div>

      <BenefitCarousel benefits={GOLD_BENEFITS} backgroundColor={REWARDS_TIER_COLORS.goldCard} />
    </div>
  )
}
