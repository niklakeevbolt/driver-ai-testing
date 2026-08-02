export const PROFILE = {
  name: 'Driver Name',
  tier: 'Silver',
  fleet: 'Bolt Flex',
}

export const METRICS = {
  rating: {
    label: 'Star rating',
    value: '4.57',
    badge: { label: 'At risk', variant: 'warning-secondary', icon: 'alert' },
  },
  accepted: {
    label: 'Accepted',
    value: '92%',
    badge: { label: 'Good', variant: 'action-secondary', icon: 'check' },
  },
  cancelled: {
    label: 'Cancelled',
    value: '2%',
    badge: { label: 'Great', variant: 'action-secondary', icon: 'double-check' },
  },
}

export const AT_RISK_ACTIONS = [
  {
    id: 'no-movement',
    label: 'Cancelled due to no movement',
    count: '1 of 3',
    variant: 'warning-secondary',
  },
  {
    id: 'offline-pay',
    label: 'Asked rider to pay offline',
    count: '1 of 3',
    variant: 'warning-secondary',
  },
  {
    id: 'overspeeding',
    label: 'Overspeeding',
    count: '1 of 5',
    variant: 'warning-secondary',
  },
]
