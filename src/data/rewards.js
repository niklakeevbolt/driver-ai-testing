export const REWARDS_PROGRESS = {
  // Title is resolved at render time via rewardsMonthTitle() so the month stays current.
  subtitle: 'Keep up to get the golden level!',
  points: 277,
  milestones: [
    { label: '100', tier: 'bronze' },
    { label: '200', tier: 'silver' },
    { label: '300', tier: 'gold' },
    { label: '400', tier: 'diamond' },
    { label: '500', tier: 'platinum' },
  ],
}

/** Figma progress fill: 133px of a 328px track. Shared so the Earnings Island bar matches the profile panel. */
export const REWARDS_PROGRESS_FILL_RATIO = 133 / 328

const TIER_NAMES = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  diamond: 'Diamond',
  platinum: 'Platinum',
}

const nextMilestone = REWARDS_PROGRESS.milestones.find(
  (milestone) => Number(milestone.label) > REWARDS_PROGRESS.points,
)

/** Tier the driver is working toward, derived from the ladder above so island copy can't drift. */
export const REWARDS_NEXT_TIER = nextMilestone
  ? {
      tier: nextMilestone.tier,
      name: TIER_NAMES[nextMilestone.tier],
      pointsAway: Number(nextMilestone.label) - REWARDS_PROGRESS.points,
    }
  : null

export const SILVER_BENEFITS = [
  {
    id: 'silver-rides',
    eyebrow: 'Top silver benefit',
    title: 'Up to 3 rides towards destination per day',
    illustration: 'map',
  },
  {
    id: 'silver-commission',
    eyebrow: 'Top silver benefit',
    title: '1% lower commission rate, given as cash bonus',
    illustration: 'commission',
  },
]

export const GOLD_BENEFITS = [
  {
    id: 'gold-rides',
    eyebrow: 'Top golden benefit',
    title: 'Up to 5 rides towards destination per day',
    illustration: 'map',
  },
  {
    id: 'gold-commission',
    eyebrow: 'Top golden benefit',
    title: '3% lower commission rate, given as cash bonus',
    illustration: 'commission',
  },
]

export const TOP_DISCOUNTS = [
  { id: 'shell', name: 'Shell', discount: '3%' },
  { id: 'circlek', name: 'CircleK', discount: '5%' },
  { id: 'autotah', name: 'Autotah', discount: '2%' },
  { id: 'eesti-gaas', name: 'eesti gaas', discount: '7%' },
]

/** Figma rewards/light tier palette — not in Clay Driver theme */
export const REWARDS_TIER_COLORS = {
  silverText: 'rgba(0, 32, 55, 0.68)',
  goldText: '#8A5D00',
  goldCard: 'rgba(243, 173, 32, 0.28)',
  silverCard: 'rgba(0, 77, 141, 0.08)',
  progressTrack: 'rgba(73, 93, 122, 0.16)',
}
