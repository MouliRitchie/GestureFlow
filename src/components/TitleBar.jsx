const api = window.electronAPI

export function TitleBar({ title = "GestureFlow" }) {
  return (
    <div style={s.bar} className="drag-region">
      <div style={s.left}>
        <div style={s.dot} />
        <span style={s.name}>{title}</span>
      </div>
      <div style={s.controls} className="no-drag">
        <button onClick={() => api?.minimize()} style={s.btn} title="Minimize">─</button>
        <button onClick={() => api?.maximize()} style={s.btn} title="Maximize">□</button>
        <button
          onClick={() => api?.quit()}
          style={{ ...s.btn, ...s.close }}
          title="Quit"
        >✕</button>
      </div>
    </div>
  )
}

const s = {
  bar: {
    height: 40,
    background: '#0b0d12',
    borderBottom: '1px solid #1a1d27',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px 0 16px',
    flexShrink: 0,
  },
  left: { display: 'flex', alignItems: 'center', gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #00d4aa)',
  },
  name: { fontSize: 12, fontWeight: 600, color: '#5a5d78', letterSpacing: '0.05em' },
  controls: { display: 'flex', gap: 2 },
  btn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#3a3d50', fontSize: 13, width: 32, height: 28,
    borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
    fontFamily: 'monospace',
  },
  close: { color: '#ff4f6a' },
}