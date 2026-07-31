import { useEffect, useState } from 'react'

const SESSION_KEY = 'driver-ai-testing-auth'

async function sha256(text) {
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
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const expectedHash =
    import.meta.env.VITE_PASSWORD_HASH ||
    'cac3ee3ff6501eadea0106782808fd53ffccf26ee872433c99886a9727379487'

  useEffect(() => {
    const token = sessionStorage.getItem(SESSION_KEY)
    if (token && token === expectedHash) setAuthed(true)
    setReady(true)
  }, [expectedHash])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(false)
    const hash = await sha256(password)
    if (hash === expectedHash) {
      sessionStorage.setItem(SESSION_KEY, hash)
      setAuthed(true)
    } else {
      setError(true)
      setPassword('')
    }
    setSubmitting(false)
  }

  if (!ready) return null
  if (authed) return children

  return (
    <div className="flex min-h-screen items-center justify-center bg-layer-floor-0-grouped p-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-layer-floor-1 p-8 shadow-[0_8px_32px_rgba(0,45,30,0.12)]"
      >
        <div>
          <h1 className="bolt-font-heading-s-accent text-primary">Driver AI Testing</h1>
          <p className="mt-2 bolt-font-body-s text-secondary">
            Enter the access password to view this prototype.
          </p>
        </div>
        <label className="flex flex-col gap-2">
          <span className="bolt-font-body-s-accent text-primary">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            autoFocus
            className="h-12 rounded-xl border border-separator px-4 bolt-font-body-m text-primary"
          />
        </label>
        {error ? <p className="bolt-font-body-s text-danger-primary">Incorrect password. Try again.</p> : null}
        <button
          type="submit"
          disabled={submitting || !password}
          className="h-12 rounded-full bg-primary text-primary-inverse bolt-font-body-m-accent disabled:opacity-40"
        >
          {submitting ? 'Checking…' : 'Continue'}
        </button>
      </form>
    </div>
  )
}
