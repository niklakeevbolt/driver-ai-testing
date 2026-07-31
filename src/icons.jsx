import { ArrowBack, Compass, Map, Route, UserAlt } from '@icons'

const iconProps = {
  'aria-hidden': true,
  focusable: false,
  size: 'md',
}

export const IconBack = () => <ArrowBack {...iconProps} />

export const IconTrips = () => <Route {...iconProps} />

export const IconMap = () => <Map {...iconProps} />

export const IconHub = () => <Compass {...iconProps} />

export const IconUser = () => <UserAlt {...iconProps} />
