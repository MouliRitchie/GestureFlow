import { useEffect, useState } from 'react'

const API = 'http://localhost:8765'

export function Welcome({ onConfigured, onSetup }) {
  const [checking, setChecking] = useState(true)
  const [backendReady, setBackendReady] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch(`${API}/config`)
        const data = await r.json()
        setBackendReady(true)
        setChecking(false)
        // Auto-route after brief welcome
        setTimeout(() => {
          if (data.configured) onConfigured(data.mapping)
          else onSetup()
        }, 1800)
      } catch {
        setTimeout(check, 600)
      }
    }
    check()
  }, [])

  return (
    <div style={s.root}>
      {/* Background orbs */}
      <div style={s.orb1} />
      <div style={s.orb2} />

      <div style={s.content}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>🖐️</div>
          <h1 style={s.title}>
            Gesture<span style={s.titleAccent}>Flow</span>
          </h1>
          <p style={s.sub}>Control your PC with your hands</p>
        </div>

        {/* Status */}
        <div style={s.status}>
          {checking ? (
            <div style={s.row}>
              <div style={s.spinner} />
              <span style={s.statusText}>Connecting to gesture engine...</span>
            </div>
          ) : (
            <div style={{ ...s.row, animation: 'fadeUp 0.4s ease' }}>
              <span style={s.dot} />
              <span style={{ ...s.statusText, color: '#00d4aa' }}>Ready</span>
            </div>
          )}
        </div>
      </div>

      <div style={s.version}>v1.0</div>
    </div>
  )
}

const s = {
  root: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  },
  orb1: {
    position: 'absolute', width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
    top: '10%', left: '15%', filter: 'blur(40px)',
  },
  orb2: {
    position: 'absolute', width: 350, height: 350, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,212,170,0.1) 0%, transparent 70%)',
    bottom: '10%', right: '15%', filter: 'blur(40px)',
  },
  content: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40,
    animation: 'fadeUp 0.6s ease',
  },
  logoWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  logoIcon: { fontSize: 72, filter: 'drop-shadow(0 0 30px rgba(108,99,255,0.5))' },
  title: {
    fontFamily: 'Outfit', fontWeight: 800, fontSize: 52, letterSpacing: '-0.02em',
    color: '#eaeaf0',
  },
  titleAccent: {
    background: 'linear-gradient(135deg, #6c63ff, #00d4aa)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  sub: { fontSize: 16, color: '#5a5d78', fontWeight: 400 },
  status: { height: 32 },
  row: { display: 'flex', alignItems: 'center', gap: 10 },
  spinner: {
    width: 16, height: 16, borderRadius: '50%',
    border: '2px solid #252836', borderTop: '2px solid #6c63ff',
    animation: 'spin 0.7s linear infinite',
  },
  dot: {
    width: 8, height: 8, borderRadius: '50%', background: '#00d4aa',
    boxShadow: '0 0 10px #00d4aa', animation: 'pulse 1.5s ease infinite',
  },
  statusText: { fontSize: 13, color: '#5a5d78', fontFamily: 'JetBrains Mono' },
  version: {
    position: 'absolute', bottom: 16, right: 20,
    fontSize: 10, color: '#252836', fontFamily: 'JetBrains Mono',
  },
}