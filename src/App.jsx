import { useState } from 'react'
import { TitleBar } from './components/TitleBar'
import { Welcome } from './screens/Welcome'
import { Setup } from './screens/Setup'
import { Dashboard } from './screens/Dashboard'

// Screens: 'welcome' | 'setup' | 'dashboard'
export default function App() {
  const [screen, setScreen] = useState('welcome')
  const [mapping, setMapping] = useState(null)

  const goSetup = () => setScreen('setup')

  const goConfigured = (savedMapping) => {
    setMapping(savedMapping)
    setScreen('dashboard')
  }

  const onSetupDone = (newMapping) => {
    setMapping(newMapping)
    setScreen('dashboard')
  }

  const onReset = () => {
    setMapping(null)
    setScreen('setup')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TitleBar title={screen === 'welcome' ? 'GestureFlow' : screen === 'setup' ? 'GestureFlow — Setup' : 'GestureFlow — Dashboard'} />

      {screen === 'welcome' && (
        <Welcome onConfigured={goConfigured} onSetup={goSetup} />
      )}
      {screen === 'setup' && (
        <Setup onDone={onSetupDone} initialMapping={mapping} />
      )}
      {screen === 'dashboard' && (
        <Dashboard mapping={mapping} onReset={onReset} />
      )}
    </div>
  )
}
