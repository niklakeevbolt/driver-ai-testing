import { createContext, use, useMemo } from 'react'
import { getCountry, resolveCountrySlug } from '../data/countries/index.js'

const CountryContext = createContext(null)

export function CountryProvider({ children, slug: slugProp }) {
  const value = useMemo(() => {
    const slug = slugProp ?? resolveCountrySlug()
    const country = getCountry(slug)
    return { slug, country }
  }, [slugProp])

  return <CountryContext value={value}>{children}</CountryContext>
}

export function useCountry() {
  const ctx = use(CountryContext)
  if (!ctx?.country) {
    throw new Error('useCountry requires a valid country route')
  }
  return ctx.country
}

export function useCountryOptional() {
  return use(CountryContext)
}
