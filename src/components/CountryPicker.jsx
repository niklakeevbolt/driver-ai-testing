import { COUNTRY_LIST, countryHref } from '../data/countries/index.js'

export default function CountryPicker() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 24,
        background: '#f0f2f5',
        fontFamily: 'system-ui, sans-serif',
        color: '#191f1c',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.4px' }}>
          Driver AI Testing
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: '#5c6670', lineHeight: 1.45 }}>
          Pick a market. Currency, campaigns, map location, and driver metrics update for that capital.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 360 }}>
        {COUNTRY_LIST.map((country) => (
          <a
            key={country.slug}
            href={countryHref(country.slug)}
            style={{
              display: 'block',
              padding: '16px 20px',
              borderRadius: 16,
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              textDecoration: 'none',
              color: '#191f1c',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>{country.name}</div>
            <div style={{ fontSize: 14, color: '#5c6670', marginTop: 4 }}>
              {country.capital} · {country.money.code}
            </div>
            <div style={{ fontSize: 13, color: '#808c9f', marginTop: 8, fontFamily: 'ui-monospace, monospace' }}>
              /{country.slug}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
