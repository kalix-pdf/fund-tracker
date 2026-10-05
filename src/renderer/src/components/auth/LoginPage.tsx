import { useId, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { authenticate } from './Auth'
import communityImage from '../../assets/community.png'
import logo from '../../assets/logo.png'
import '../../styles/app.css'

// interface LoginPageProps {
//   onLoginSuccess: () => void
// }

function EyeIcon({ off }: { off: boolean }): React.JSX.Element {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  )
}

export function LoginPage(): React.JSX.Element {
  const usernameId = useId()
  const passwordId = useId()
  const errorId = useId()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = username.trim().length > 0 && password.length > 0 && !submitting

  const handleKey = (event: KeyboardEvent<HTMLInputElement>): void => {
    setCapsLock(event.getModifierState('CapsLock'))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (!canSubmit) return

    setSubmitting(true)
    setError(null)

    try {
      const ok = await authenticate(username, password)
      if (!ok) {
        setError('Invalid username or password.')
        setPassword('')
        setSubmitting(false)
        return
      }
      await window.api.window.enterApp()

    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <main className="login">
      <section className="login__hero" aria-hidden="true">
        <img className="login__hero-image" src={communityImage} alt="" draggable={false} />
        <div className="login__hero-overlay" />
        <div className="login__hero-content">
          <span className="login__eyebrow">Totops Community</span>
          <h2>Stewarding every contribution, together.</h2>
          <p>Manage requests, liquidations, and community funds in one place.</p>
        </div>
      </section>

      <section className="login__panel">
        <form className="login__card" onSubmit={handleSubmit} noValidate>
          <header className="login__header">
            <img className="login__logo" src={logo} alt="Totops Community logo" draggable={false} />
            <h1>Welcome back</h1>
            <p>Sign in to Finance Management</p>
          </header>

          <div className="login__field">
            <label htmlFor={usernameId}>Username</label>
            <input
              id={usernameId}
              type="text"
              autoComplete="username"
              autoFocus
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            />
          </div>

          <div className="login__field">
            <label htmlFor={passwordId}>Password</label>
            <div className="login__input-wrap">
              <input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKey}
                onKeyUp={handleKey}
                onBlur={() => setCapsLock(false)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
              />
              <button
                type="button"
                className="login__toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                <EyeIcon off={showPassword} />
              </button>
            </div>
            {capsLock && <span className="login__hint">Caps Lock is on</span>}
          </div>

          <p id={errorId} className="login__error" role="alert" aria-live="polite">
            {error}
          </p>

          <button type="submit" className="btn btn--primary login__submit" disabled={!canSubmit}>
            {submitting ? <span className="login__spinner" aria-hidden="true" /> : null}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <footer className="login__footer">© {new Date().getFullYear()} Totops Community</footer>
      </section>
    </main>
  )
}