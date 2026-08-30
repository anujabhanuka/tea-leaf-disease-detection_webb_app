import { useState, type FormEvent } from 'react'
import { authenticate } from '../api'

type Props = { onAuthenticated: (token: string) => void }

export default function Auth({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await authenticate(
        mode,
        username.trim(),
        password,
        mode === 'register' ? { email: email.trim(), mobile: mobile.trim() } : undefined,
        mode === 'login' ? 'web' : undefined,
      )
      if (mode === 'register') {
        setMode('login')
        setPassword('')
        setError('Account created. Sign in to continue.')
      } else {
        onAuthenticated(data.access_token)
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to connect to the API')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen auth-screen">
      <div className="auth-copy">
        <p className="eyebrow">TeaLeaf workspace</p>
        <h1>See what your leaves are telling you.</h1>
        <p>Sign in to analyze images and keep a private record of every diagnosis.</p>
      </div>
      <form className="auth-form" onSubmit={submit}>
        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button>
        </div>
        <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} required /></label>
        {mode === 'register' && (
          <>
            <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Mobile number<input type="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} pattern="[+0-9 ()-]{7,}" required /></label>
          </>
        )}
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
    </div>
  )
}
