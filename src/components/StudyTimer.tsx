/**
 * STUDY TIMER PANEL — Full timer controls panel (opens from desk tools).
 * Receives timer state from App via props — does NOT own state.
 */
import type { StudyTimerState } from '../hooks/useStudyTimer'
import { fmtTime, loadLog } from '../hooks/useStudyTimer'

interface Props {
  timer: StudyTimerState
  classes: string[]
  onClose: () => void
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function StudyTimer({ timer, classes, onClose }: Props) {
  const { course, setCourse, elapsed, running, start, pause, logAndReset, discard } = timer
  const today = getToday()
  const log = loadLog()
  const todayEntries = log.filter(e => e.date === today)
  const todayTotal = todayEntries.reduce((sum, e) => sum + e.seconds, 0) + (running ? elapsed : 0)

  return (
    <div className="panel animate-slideDown" style={{ padding: '20px 24px', marginBottom: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase' as const, color: '#5A3E4B',
        }}>Study Timer</span>
        <button onClick={onClose} style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 10, color: '#E8B8C0', background: 'none', border: 'none', cursor: 'pointer',
        }}>close</button>
      </div>

      {/* Course selector */}
      <select value={course} onChange={e => setCourse(e.target.value)}
        disabled={running} className="input-warm" aria-label="Select course to study"
        style={{
          width: '100%', padding: '6px 10px', marginBottom: 12,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 13, fontStyle: 'italic',
          cursor: running ? 'not-allowed' : 'pointer',
        }}>
        {classes.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {/* Timer display */}
      <div style={{
        textAlign: 'center', padding: '14px 0', marginBottom: 10,
        borderTop: '1px solid rgba(240,160,180,0.15)',
        borderBottom: '1px solid rgba(240,160,180,0.15)',
      }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 36, fontWeight: 700,
          color: running ? '#C88898' : '#5A3E4B',
          letterSpacing: '0.06em', lineHeight: 1, transition: 'color 0.3s',
        }}>
          {fmtTime(elapsed)}
        </div>
        {running && (
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 9, fontStyle: 'italic', color: '#F0849C',
            marginTop: 4, letterSpacing: '0.15em',
          }}>
            studying {course.split(/\s*[—\-·]\s*/)[0]}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
        {!running ? (
          <button onClick={start} className="btn-primary" style={{ minWidth: 80 }}>
            {elapsed > 0 ? 'Resume' : 'Begin'}
          </button>
        ) : (
          <button onClick={pause} className="btn-primary" style={{ minWidth: 80 }}>Pause</button>
        )}
        {elapsed > 0 && (
          <>
            <button onClick={logAndReset} className="desk-tool-btn" style={{ fontSize: 10 }}>
              Log &amp; Reset
            </button>
            <button onClick={discard} className="desk-tool-btn" style={{ fontSize: 10, color: '#E8B8C0' }}>
              Discard
            </button>
          </>
        )}
      </div>

      {/* Today's summary */}
      {(todayEntries.length > 0 || elapsed > 0) && (
        <div style={{ borderTop: '1px solid rgba(240,160,180,0.15)', paddingTop: 10 }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase' as const, color: '#5A3E4B', marginBottom: 6,
          }}>Today — {fmtTime(todayTotal)}</div>
          {todayEntries.map((e, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 11, fontStyle: 'italic', color: '#5A3E4B', padding: '2px 0',
            }}>
              <span>{e.course.split(/\s*[—\-·]\s*/)[0]}</span>
              <span style={{ color: '#C88898' }}>{fmtTime(e.seconds)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}