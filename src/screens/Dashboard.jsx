import { useState, useEffect, useRef } from 'react'

const API = 'http://localhost:8765'
const WS = 'ws://localhost:8765/ws'

const GESTURES = [
  { id: 'open_palm', emoji: '✋', name: 'Open Palm' },
  { id: 'fist', emoji: '✊', name: 'Fist' },
  { id: 'index_up', emoji: '☝️', name: 'Point Up' },
  { id: 'peace', emoji: '✌️', name: 'Peace' },
  { id: 'three_fingers', emoji: '🤟', name: '3 Fingers' },
  { id: 'four_fingers', emoji: '🖐️', name: '4 Fingers' },
  { id: 'thumbs_up', emoji: '👍', name: 'Thumbs Up' },
  { id: 'thumbs_down', emoji: '👎', name: 'Thumbs Down' },
  { id: 'hang_loose', emoji: '🤙', name: 'Hang Loose' },
  { id: 'rock_on', emoji: '🤘', name: 'Rock On' },
  { id: 'pinch_close', emoji: '🤏', name: 'Pinch Close' },
  { id: 'pinch_open', emoji: '🫰', name: 'Pinch Open' },
  { id: 'ok_sign', emoji: '👌', name: 'OK Sign' },
  { id: 'vulcan', emoji: '🖖', name: 'Vulcan' },
  { id: 'point_forward', emoji: '👉', name: 'Point Side' },
]

const OPERATIONS = [
  { id: 'volume_up', emoji: '🔊', name: 'Volume Up' },
  { id: 'volume_down', emoji: '🔉', name: 'Volume Down' },
  { id: 'mute_toggle', emoji: '🔇', name: 'Mute' },
  { id: 'scroll_up', emoji: '⬆️', name: 'Scroll Up' },
  { id: 'scroll_down', emoji: '⬇️', name: 'Scroll Down' },
  { id: 'mouse_control', emoji: '🖱️', name: 'Mouse' },
  { id: 'left_click', emoji: '👆', name: 'Left Click' },
  { id: 'screenshot', emoji: '📸', name: 'Screenshot' },
  { id: 'brightness_up', emoji: '☀️', name: 'Bright Up' },
  { id: 'brightness_down', emoji: '🌙', name: 'Bright Down' },
]

export function Dashboard({ mapping, onReset }) {
  const [running, setRunning] = useState(false)
  const [gesture, setGesture] = useState('none')
  const [operation, setOperation] = useState('none')
  const [frame, setFrame] = useState(null)
  const [quitting, setQuitting] = useState(false)
  const wsRef = useRef(null)

  // Reverse mapping: gesture -> operation
  const gestureToOp = Object.fromEntries(
    Object.entries(mapping).map(([op, gest]) => [gest, op])
  )

  // Mapping summary: operation -> gesture
  const mappingSummary = OPERATIONS.map(op => ({
    ...op,
    gesture: GESTURES.find(g => g.id === mapping[op.id]),
  }))

  // WebSocket
  useEffect(() => {
    if (!running) {
      wsRef.current?.close()
      setFrame(null); setGesture('none'); setOperation('none')
      return
    }
    const ws = new WebSocket(WS)
    wsRef.current = ws
    ws.onmessage = e => {
      const d = JSON.parse(e.data)
      setGesture(d.gesture || 'none')
      setOperation(d.operation || 'none')
      if (d.frame) setFrame(d.frame)
    }
    ws.onclose = () => { setFrame(null); setGesture('none') }
    const ping = setInterval(() => ws.readyState === 1 && ws.send('ping'), 4000)
    return () => { clearInterval(ping); ws.close() }
  }, [running])

  const toggleRun = async () => {
    const endpoint = running ? '/stop' : '/start'
    await fetch(`${API}${endpoint}`, { method: 'POST' }).catch(() => { })
    setRunning(!running)
  }

  const quit = async () => {
    setQuitting(true)
    if (running) await fetch(`${API}/stop`, { method: 'POST' }).catch(() => { })
    window.electronAPI?.quit()
    // Fallback for browser dev mode
    setTimeout(() => {
      document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
          height:100vh;background:#0b0d12;color:#3a3d50;font-family:Outfit,sans-serif;gap:16px">
          <div style="font-size:48px">🖐️</div>
          <div style="font-size:20px;font-weight:700">GestureFlow stopped</div>
          <div style="font-size:13px">You can close this window.</div>
        </div>`
    }, 400)
  }

  const resetSetup = async () => {
    if (!confirm('Reset all gesture mappings and go back to setup?')) return
    if (running) { await fetch(`${API}/stop`, { method: 'POST' }); setRunning(false) }
    await fetch(`${API}/config/reset`, { method: 'POST' })
    onReset()
  }

  const activeGestureInfo = GESTURES.find(g => g.id === gesture)
  const activeOpInfo = OPERATIONS.find(o => o.id === operation)

  return (
    <div style={s.root}>
      {/* Left: camera + live status */}
      <div style={s.left}>
        {/* Camera viewport */}
        <div style={s.viewport}>
          {frame ? (
            <img src={`data:image/jpeg;base64,${frame}`} style={s.camImg} alt="feed" />
          ) : (
            <div style={s.camPlaceholder}>
              {running ? (
                <><div style={s.spinner} /><span style={s.camHint}>Starting camera...</span></>
              ) : (
                <><div style={s.camIcon}>📷</div><span style={s.camHint}>Press Start to activate</span></>
              )}
            </div>
          )}
          {/* Overlay badge */}
          <div style={s.camBadge}>
            <div style={{ ...s.camDot, background: running ? '#00d4aa' : '#3a3d50' }} />
            {running ? 'LIVE' : 'PAUSED'}
          </div>
        </div>

        {/* Live gesture display */}
        <div style={s.liveBox}>
          <div style={s.liveHalf}>
            <div style={s.liveLabel}>GESTURE</div>
            <div style={s.liveValue}>
              {activeGestureInfo
                ? <><span style={s.liveEmoji}>{activeGestureInfo.emoji}</span> {activeGestureInfo.name}</>
                : <span style={{ color: '#3a3d50' }}>—</span>
              }
            </div>
          </div>
          <div style={s.liveDivider} />
          <div style={s.liveHalf}>
            <div style={s.liveLabel}>ACTION</div>
            <div style={{ ...s.liveValue, color: '#00d4aa' }}>
              {activeOpInfo
                ? <><span style={s.liveEmoji}>{activeOpInfo.emoji}</span> {activeOpInfo.name}</>
                : <span style={{ color: '#3a3d50' }}>—</span>
              }
            </div>
          </div>
        </div>

        {/* Control buttons */}
        <div style={s.controls}>
          <button
            onClick={toggleRun}
            style={{
              ...s.startBtn,
              background: running
                ? 'transparent'
                : 'linear-gradient(135deg, #6c63ff, #5a52e0)',
              borderColor: running ? '#ff4f6a' : 'transparent',
              color: running ? '#ff4f6a' : '#fff',
              boxShadow: running ? 'none' : '0 4px 20px rgba(108,99,255,0.4)',
            }}
          >
            {running ? '⏹ Stop' : '▶ Start'}
          </button>
          <button onClick={resetSetup} style={s.resetBtn} title="Change gesture mappings">
            ⚙ Reset Setup
          </button>
          <button onClick={quit} disabled={quitting} style={s.quitBtn}>
            {quitting ? '...' : '✕ Quit'}
          </button>
        </div>
      </div>

      {/* Right: mapping summary */}
      <div style={s.right}>
        <div style={s.mapTitle}>YOUR GESTURE MAP</div>
        <div style={s.mapList}>
          {mappingSummary.map(op => (
            <div
              key={op.id}
              style={{
                ...s.mapRow,
                background: operation === op.id ? 'rgba(0,212,170,0.07)' : 'transparent',
                borderColor: operation === op.id ? '#00d4aa' : '#1a1d27',
              }}
            >
              <span style={s.mapOpEmoji}>{op.emoji}</span>
              <span style={s.mapOpName}>{op.name}</span>
              <div style={s.mapArrow}>→</div>
              {op.gesture ? (
                <div style={s.mapGesture}>
                  <span>{op.gesture.emoji}</span>
                  <span style={s.mapGestureName}>{op.gesture.name}</span>
                </div>
              ) : (
                <span style={{ color: '#3a3d50', fontSize: 11 }}>unassigned</span>
              )}
            </div>
          ))}
        </div>
        <div style={s.tip}>
          💡 Screenshots save to ~/Pictures/GestureFlow
        </div>
      </div>
    </div>
  )
}

const s = {
  root: {
    flex: 1, display: 'grid', gridTemplateColumns: '420px 1fr',
    gap: 20, padding: '16px 20px', overflow: 'hidden',
    animation: 'fadeUp 0.4s ease',
  },
  left: { display: 'flex', flexDirection: 'column', gap: 12 },
  viewport: {
    flex: 1, background: '#0d0f17', borderRadius: 12, overflow: 'hidden',
    border: '1px solid #1a1d27', position: 'relative', minHeight: 0,
    aspectRatio: '4/3',
  },
  camImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  camPlaceholder: {
    position: 'absolute', inset: 0, display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  camIcon: { fontSize: 36, opacity: 0.3 },
  camHint: { fontSize: 12, color: '#3a3d50', fontFamily: 'JetBrains Mono' },
  spinner: {
    width: 24, height: 24, borderRadius: '50%',
    border: '2px solid #252836', borderTop: '2px solid #6c63ff',
    animation: 'spin 0.7s linear infinite',
  },
  camBadge: {
    position: 'absolute', top: 10, left: 10,
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(11,13,18,0.85)', backdropFilter: 'blur(6px)',
    border: '1px solid #252836', borderRadius: 6,
    padding: '4px 10px', fontSize: 9,
    fontFamily: 'JetBrains Mono', letterSpacing: '0.15em', color: '#5a5d78',
  },
  camDot: { width: 6, height: 6, borderRadius: '50%', transition: 'all 0.3s' },
  liveBox: {
    display: 'flex', background: '#13151c', border: '1px solid #1a1d27',
    borderRadius: 10, overflow: 'hidden', flexShrink: 0,
  },
  liveHalf: { flex: 1, padding: '12px 16px' },
  liveDivider: { width: 1, background: '#1a1d27', flexShrink: 0 },
  liveLabel: { fontSize: 9, color: '#3a3d50', letterSpacing: '0.18em', fontFamily: 'JetBrains Mono', marginBottom: 6 },
  liveValue: { fontSize: 15, fontWeight: 700, color: '#eaeaf0', display: 'flex', alignItems: 'center', gap: 6 },
  liveEmoji: { fontSize: 18 },
  controls: { display: 'flex', gap: 8, flexShrink: 0 },
  startBtn: {
    flex: 1, padding: '12px', border: '1.5px solid transparent', borderRadius: 9,
    fontSize: 15, fontWeight: 700, fontFamily: 'Outfit', cursor: 'pointer',
    transition: 'all 0.2s',
  },
  resetBtn: {
    padding: '12px 16px', background: 'transparent', border: '1.5px solid #252836',
    borderRadius: 9, color: '#5a5d78', fontSize: 13, fontFamily: 'Outfit',
    cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', whiteSpace: 'nowrap',
  },
  quitBtn: {
    padding: '12px 16px', background: 'transparent', border: '1.5px solid #2a1520',
    borderRadius: 9, color: '#ff4f6a', fontSize: 13, fontFamily: 'Outfit',
    cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', whiteSpace: 'nowrap',
  },
  right: {
    display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden',
  },
  mapTitle: {
    fontSize: 9, letterSpacing: '0.18em', color: '#3a3d50',
    fontFamily: 'JetBrains Mono', flexShrink: 0,
  },
  mapList: { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 },
  mapRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 8,
    border: '1px solid', transition: 'all 0.2s',
  },
  mapOpEmoji: { fontSize: 16, flexShrink: 0, width: 22 },
  mapOpName: { fontSize: 12, fontWeight: 600, color: '#eaeaf0', flex: 1 },
  mapArrow: { color: '#252836', fontSize: 14, flexShrink: 0 },
  mapGesture: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#1a1d27', borderRadius: 6, padding: '3px 10px',
    flexShrink: 0,
  },
  mapGestureName: { fontSize: 11, color: '#5a5d78' },
  tip: { fontSize: 11, color: '#2a2d3a', flexShrink: 0 },
}