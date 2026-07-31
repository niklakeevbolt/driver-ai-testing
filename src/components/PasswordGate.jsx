import { useEffect, useState } from 'react'

const SESSION_KEY = 'driver-ai-testing-auth'
const DEFAULT_HASH = 'cac3ee3ff6501eadea0106782808fd53ffccf26ee872433c99886a9727379487'

async function sha256(text) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure browser context required for password check.')
  }
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export default function PasswordGate({ children }) {
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const expectedHash = import.meta.env.VITE_PASSWORD_HASH || DEFAULT_HASH

  useEffect(() => {
    try {
      const token = sessionStorage.getItem(SESSION_KEY)
      if (token && token === expectedHash) setAuthed(true)
    } catch {
      // sessionStorage blocked — user can still enter password each visit
    }
    setReady(true)
  }, [expectedHash])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const hash = await sha256(password)
      if (hash === expectedHash) {
        sessionStorage.setItem(SESSION_KEY, hash)
        setAuthed(true)
      } else {
        setError('Incorrect password. Try again.')
        setPassword('')
      }
    } catch (submitError) {
      setError(submitError?.message || 'Unable to verify password.')
    }

    setSubmitting(false)
  }

  if (authed) return children

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#f0f2f5',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 360,
          padding: 32,
          borderRadius: 16,
          background: '#fff',
          boxShadow: '0 8px 32px rgba(0, 45, 30, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#191f1c' }}>
            Driver AI Testing
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: 'rgba(25, 31, 28, 0.72)' }}>
            {ready ? 'Enter the access password to view this prototype.' : 'Loading…'}
          </p>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#191f1c' }}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            autoFocus
            disabled={!ready}
            style={{
              height: 48,
              padding: '0 16px',
              borderRadius: 12,
              border: error ? '1px solid #d4193d' : '1px solid rgba(0, 45, 30, 0.16)',
              fontSize: 16,
            }}
          />
        </label>

        {error ? <p style={{ margin: 0, fontSize: 13, color: '#d4193d' }}>{error}</p> : null}

        <button
          type="submit"
          disabled={!ready || submitting || !password}
          style={{
            height: 48,
            borderRadius: 9999,
            border: 'none',
            background: !ready || submitting || !password ? 'rgba(25, 31, 28, 0.24)' : '#191f1c',
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
            cursor: !ready || submitting || !password ? 'default' : 'pointer',
          }}
        >
          {submitting ? 'Checking…' : 'Continue'}
        </button>
      </form>
    </div>
  )
}
