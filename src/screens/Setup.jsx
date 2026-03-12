import { useState, useEffect } from 'react'

const API = 'http://localhost:8765'

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
  { id: 'volume_up', emoji: '🔊', name: 'Volume Up', group: 'Audio' },
  { id: 'volume_down', emoji: '🔉', name: 'Volume Down', group: 'Audio' },
  { id: 'mute_toggle', emoji: '🔇', name: 'Mute / Unmute', group: 'Audio' },
  { id: 'scroll_up', emoji: '⬆️', name: 'Scroll Up', group: 'Navigation' },
  { id: 'scroll_down', emoji: '⬇️', name: 'Scroll Down', group: 'Navigation' },
  { id: 'mouse_control', emoji: '🖱️', name: 'Mouse Control', group: 'Mouse' },
  { id: 'left_click', emoji: '👆', name: 'Left Click', group: 'Mouse' },
  { id: 'screenshot', emoji: '📸', name: 'Screenshot', group: 'System' },
  { id: 'brightness_up', emoji: '☀️', name: 'Brightness Up', group: 'Display' },
  { id: 'brightness_down', emoji: '🌙', name: 'Brightness Down', group: 'Display' },
]

const DEFAULT = {
  volume_up: 'thumbs_up', volume_down: 'thumbs_down', mute_toggle: 'rock_on',
  scroll_up: 'peace', scroll_down: 'three_fingers', mouse_control: 'index_up',
  left_click: 'ok_sign', screenshot: 'open_palm', brightness_up: 'hang_loose',
  brightness_down: 'fist',
}

export function Setup({ onDone, initialMapping }) {
  const [mapping, setMapping] = useState(initialMapping || { ...DEFAULT })
  const [activeOp, setActiveOp] = useState(OPERATIONS[0].id)
  const [saving, setSaving] = useState(false)

  const usedGestures = Object.values(mapping)
  const activeGesture = mapping[activeOp]

  const assign = (gestureId) => {
    setMapping(prev => ({ ...prev, [activeOp]: gestureId }))
    // Auto-advance to next unassigned operation
    const nextIdx = OPERATIONS.findIndex(o => o.id === activeOp) + 1
    if (nextIdx < OPERATIONS.length) setActiveOp(OPERATIONS[nextIdx].id)
  }

  const save = async () => {
    setSaving(true)
    try {
      await fetch(`${API}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mapping }),
      })
      onDone(mapping)
    } catch (e) {
      alert('Could not save. Make sure the backend is running.')
    }
    setSaving(false)
  }

  const allAssigned = OPERATIONS.every(op => mapping[op.id])

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Set Up Your Gestures</h2>
          <p style={s.sub}>
            Click an operation on the left, then pick a gesture on the right.
          </p>
        </div>
        <div style={s.progress}>
          <span style={s.progressNum}>{Object.keys(mapping).length}</span>
          <span style={s.progressOf}>/ {OPERATIONS.length}</span>
          <span style={s.progressLabel}>assigned</span>
        </div>
      </div>

      <div style={s.body}>
        {/* Operations list */}
        <div style={s.opList}>
          <div style={s.colLabel}>OPERATIONS</div>
          {OPERATIONS.map(op => {
            const assignedGesture = GESTURES.find(g => g.id === mapping[op.id])
            const isActive = activeOp === op.id
            return (
              <div
                key={op.id}
                onClick={() => setActiveOp(op.id)}
                style={{
                  ...s.opCard,
                  background: isActive ? '#1e2133' : 'transparent',
                  borderColor: isActive ? '#6c63ff' : 'transparent',
                }}
              >
                <span style={s.opEmoji}>{op.emoji}</span>
                <div style={s.opInfo}>
                  <div style={s.opName}>{op.name}</div>
                  <div style={s.opGroup}>{op.group}</div>
                </div>
                {assignedGesture && (
                  <div style={s.assignedTag}>
                    {assignedGesture.emoji} {assignedGesture.name}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Gesture picker */}
        <div style={s.picker}>
          <div style={s.colLabel}>
            CHOOSE GESTURE FOR&nbsp;
            <span style={{ color: '#6c63ff' }}>
              {OPERATIONS.find(o => o.id === activeOp)?.name.toUpperCase()}
            </span>
          </div>
          <div style={s.gestureGrid}>
            {GESTURES.map(g => {
              const isSelected = activeGesture === g.id
              const usedByOther = usedGestures.includes(g.id) && !isSelected
              const usedBy = usedByOther
                ? OPERATIONS.find(o => mapping[o.id] === g.id)
                : null

              return (
                <div
                  key={g.id}
                  onClick={() => assign(g.id)}
                  title={usedBy ? `Currently used by: ${usedBy.name}` : g.name}
                  style={{
                    ...s.gestureCard,
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(108,99,255,0.25), rgba(0,212,170,0.15))'
                      : '#13151c',
                    border: isSelected
                      ? '1.5px solid #6c63ff'
                      : usedByOther
                        ? '1.5px solid #252836'
                        : '1.5px solid #1a1d27',
                    opacity: usedByOther ? 0.45 : 1,
                  }}
                >
                  <div style={s.gestureEmoji}>{g.emoji}</div>
                  <div style={s.gestureName}>{g.name}</div>
                  {isSelected && <div style={s.checkmark}>✓</div>}
                  {usedByOther && (
                    <div style={s.usedBadge} title={`Used by ${usedBy?.name}`}>
                      {usedBy?.emoji}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <p style={s.footerNote}>
          💡 You can reassign gestures later using "Reset Setup" in the dashboard.
        </p>
        <button
          onClick={save}
          disabled={saving}
          style={{ ...s.saveBtn, opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Saving...' : allAssigned ? '✓ Save & Start →' : 'Save & Continue →'}
        </button>
      </div>
    </div>
  )
}

const s = {
  root: {
    flex: 1, display: 'flex', flexDirection: 'column',
    padding: '20px 24px 16px', gap: 16, overflow: 'hidden',
    animation: 'fadeUp 0.4s ease',
  },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
  },
  title: { fontSize: 22, fontWeight: 700, color: '#eaeaf0', marginBottom: 4 },
  sub: { fontSize: 13, color: '#5a5d78' },
  progress: { display: 'flex', alignItems: 'baseline', gap: 4, flexShrink: 0 },
  progressNum: { fontSize: 32, fontWeight: 800, color: '#6c63ff' },
  progressOf: { fontSize: 18, color: '#3a3d50', fontWeight: 500 },
  progressLabel: { fontSize: 12, color: '#3a3d50', marginLeft: 4 },
  body: { flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, overflow: 'hidden' },
  colLabel: {
    fontSize: 9, letterSpacing: '0.18em', color: '#3a3d50',
    marginBottom: 8, fontFamily: 'JetBrains Mono',
  },
  opList: { display: 'flex', flexDirection: 'column', overflow: 'auto', gap: 3 },
  opCard: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
    border: '1.5px solid', transition: 'all 0.15s',
  },
  opEmoji: { fontSize: 18, flexShrink: 0 },
  opInfo: { flex: 1 },
  opName: { fontSize: 13, fontWeight: 600, color: '#eaeaf0' },
  opGroup: { fontSize: 10, color: '#3a3d50', marginTop: 1 },
  assignedTag: {
    fontSize: 10, background: '#1a1d27', border: '1px solid #252836',
    borderRadius: 4, padding: '2px 7px', color: '#5a5d78', flexShrink: 0, whiteSpace: 'nowrap',
  },
  picker: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  gestureGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 8, overflow: 'auto', paddingBottom: 4,
  },
  gestureCard: {
    position: 'relative', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 6, padding: '14px 8px',
    borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
  },
  gestureEmoji: { fontSize: 30 },
  gestureName: { fontSize: 10, color: '#5a5d78', textAlign: 'center', fontWeight: 500 },
  checkmark: {
    position: 'absolute', top: 6, right: 8,
    fontSize: 10, color: '#00d4aa', fontWeight: 700,
  },
  usedBadge: {
    position: 'absolute', top: 5, right: 6, fontSize: 9,
  },
  footer: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 12, borderTop: '1px solid #1a1d27',
  },
  footerNote: { fontSize: 12, color: '#3a3d50' },
  saveBtn: {
    background: 'linear-gradient(135deg, #6c63ff, #5a52e0)',
    border: 'none', borderRadius: 8, color: '#fff',
    fontFamily: 'Outfit', fontWeight: 700, fontSize: 14,
    padding: '11px 28px', cursor: 'pointer', transition: 'all 0.2s',
    boxShadow: '0 4px 20px rgba(108,99,255,0.35)',
  },
}