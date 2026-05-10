import { useState } from 'react'
import type { FormEvent } from 'react'
import { Input, Button } from '@wio/design-system/src/components'
import { ApplicationLayout } from '../components'
import { useApplication } from '../hooks'

export function BusinessActivities() {
  const { state, dispatch, goTo } = useApplication()
  const { activities, primaryActivityIndex, business } = state

  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newActivity, setNewActivity] = useState('')

  if (!business) { goTo('start'); return null }

  function startEdit(index: number) {
    setEditingIndex(index)
    setEditValue(activities[index])
  }

  function commitEdit(index: number) {
    const trimmed = editValue.trim()
    if (trimmed) {
      dispatch({ type: 'UPDATE_ACTIVITY', index, value: trimmed })
    }
    setEditingIndex(null)
    setEditValue('')
  }

  function removeActivity(index: number) {
    if (activities.length === 1) return
    dispatch({ type: 'REMOVE_ACTIVITY', index })
  }

  function addActivity() {
    const trimmed = newActivity.trim()
    if (!trimmed) return
    dispatch({ type: 'ADD_ACTIVITY', activity: trimmed })
    setNewActivity('')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    goTo('ownership')
  }

  const showPrimary = activities.length > 1

  return (
    <ApplicationLayout
      currentStep="activities"
      title="Business Activities"
      subtitle="Review and update your registered business activities."
    >
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 24 }}>
          {showPrimary && (
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-muted)' }}>
              Select your primary business activity — this will be used to describe your business model.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activities.map((activity, i) => (
              <div
                key={i}
                className={showPrimary && i === primaryActivityIndex ? 'activity-row activity-row--primary' : 'activity-row'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid',
                  borderColor: showPrimary && i === primaryActivityIndex ? 'var(--primary)' : 'var(--border)',
                  background: showPrimary && i === primaryActivityIndex ? 'rgba(124,58,237,0.06)' : 'var(--surface-2)',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                {showPrimary && (
                  <input
                    type="radio"
                    name="primary"
                    checked={i === primaryActivityIndex}
                    onChange={() => dispatch({ type: 'SET_PRIMARY_ACTIVITY', index: i })}
                    style={{ accentColor: 'var(--primary)', width: 16, height: 16, flexShrink: 0 }}
                  />
                )}

                <div style={{ flex: 1 }}>
                  {editingIndex === i ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => commitEdit(i)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); commitEdit(i) }
                        if (e.key === 'Escape') { setEditingIndex(null) }
                      }}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--primary)',
                        color: 'var(--text)',
                        fontSize: 14,
                        outline: 'none',
                        paddingBottom: 2,
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 14, color: 'var(--text)' }}>{activity}</span>
                  )}
                </div>

                {showPrimary && i === primaryActivityIndex && (
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    flexShrink: 0,
                  }}>
                    Primary
                  </span>
                )}

                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => editingIndex === i ? commitEdit(i) : startEdit(i)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      fontSize: 13,
                      padding: '4px 6px',
                      borderRadius: 6,
                    }}
                    title="Edit"
                  >
                    {editingIndex === i ? '✓' : 'Edit'}
                  </button>
                  {activities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeActivity(i)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        fontSize: 13,
                        padding: '4px 6px',
                        borderRadius: 6,
                      }}
                      title="Remove"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add new activity */}
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Input
                label=""
                placeholder="Add a new activity…"
                value={newActivity}
                onChange={e => setNewActivity(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') { e.preventDefault(); addActivity() }
                }}
              />
            </div>
            <div style={{ paddingTop: 2 }}>
              <Button variant="ghost" type="button" onClick={addActivity} disabled={!newActivity.trim()}>
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Button variant="ghost" type="button" onClick={() => goTo('license')}>Back</Button>
          <Button type="submit" disabled={activities.length === 0}>Continue</Button>
        </div>
      </form>
    </ApplicationLayout>
  )
}
