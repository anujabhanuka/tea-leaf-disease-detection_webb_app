import { useState } from 'react'
import './App.css'
import Auth from './screens/Auth'
import Landing from './screens/Landing'
import Dashboard from './screens/Dashboard'
import ImageInput from './screens/ImageInput'
import Results from './screens/Results'

type Screen = 'landing' | 'dashboard' | 'imageInput' | 'results'

type Navigate = (screen: Screen, payload?: unknown) => void

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('tealeaf_token'))
  const [screen, setScreen] = useState<Screen>('landing')
  const [payload, setPayload] = useState<unknown>(null)

  const navigate: Navigate = (to, data) => {
    setPayload(data ?? null)
    setScreen(to)
  }

  return (
    <div className="app-root">
      {token && <nav className="topnav">
        <div className="brand" onClick={() => navigate('landing')}>TeaLeaf</div>
        <div className="links">
          <button onClick={() => navigate('dashboard')} className="link">Dashboard</button>
          <button onClick={() => navigate('imageInput')} className="link">Analyze</button>
          <button onClick={() => { localStorage.removeItem('tealeaf_token'); setToken(null) }} className="link">Sign out</button>
        </div>
      </nav>}

      <main className="main">
        {!token && <Auth onAuthenticated={(newToken) => { localStorage.setItem('tealeaf_token', newToken); setToken(newToken); setScreen('dashboard') }} />}
        {token && screen === 'landing' && <Landing navigate={navigate} />}
        {token && screen === 'dashboard' && <Dashboard navigate={navigate} token={token} />}
        {token && screen === 'imageInput' && <ImageInput navigate={navigate} token={token} />}
        {token && screen === 'results' && <Results payload={payload} navigate={navigate} />}
      </main>

      <footer className="app-footer">© TeaLeaf Detection</footer>
    </div>
  )
}

export default App
