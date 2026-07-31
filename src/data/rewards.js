export const REWARDS_PROGRESS = {
  title: 'Your July progress',
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
