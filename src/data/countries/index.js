import { uk } from './uk.js'
import { romania } from './romania.js'
import { southAfrica } from './southAfrica.js'
import avatarDefault from '../../assets/profile/avatar.png'
import avatarZa from '../../assets/profile/avatar-za.jpg'

uk.avatar = avatarDefault
romania.avatar = avatarDefault
southAfrica.avatar = avatarZa

export const COUNTRIES = {
  UK: uk,
  RO: romania,
  ZA: southAfrica,
}

export const COUNTRY_LIST = [uk, romania, southAfrica]

export const DEFAULT_COUNTRY_SLUG = 'UK'

/** Resolve country slug from the path after Vite's base URL. */
export function resolveCountrySlug(pathname = window.location.pathname) {
  const base = import.meta.env.BASE_URL || '/'
  let path = pathname

  if (base !== '/') {
    const prefix = base.replace(/\/$/, '')
    if (path.startsWith(prefix)) {
      path = path.slice(prefix.length)
    }
  }

  path = path.replace(/^\/+|\/+$/g, '')
  const slug = path.split('/')[0] || ''
  return COUNTRIES[slug] ? slug : null
}

export function getCountry(slug) {
  return COUNTRIES[slug] ?? null
}

export function countryHref(slug) {
  const base = import.meta.env.BASE_URL || '/'
  const normalized = base.endsWith('/') ? base : `${base}/`
  return `${normalized}${slug}`
}
