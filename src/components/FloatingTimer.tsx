/**
 * FLOATING MINI-TIMER — Persistent bar at the bottom of the screen.
 *
 * Shows ONLY when timer is running or paused with time on the clock.
 * Stays visible during fullscreen file viewing, navigation, etc.
 * Compact: course name, elapsed time, pause/resume button.
 */
import type { StudyTimerState } from '../hooks/useStudyTimer'
import { fmtTimeShort } from '../hooks/useStudyTimer'

interface Props {
  timer: StudyTimerState
  onOpenPanel: () => void
}

export default function FloatingTimer({ timer, onOpenPanel }: Props) {
  const { course, elapsed, running, start, pause, logAndReset } = timer

  // Only show when timer has time or is running
  if (elapsed === 0 && !running) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: '8px 20px',
      background: 'rgba(255, 248, 248, 0.92)',
      borderTop: '1px solid rgba(200, 170, 160, 0.8)',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 -2px 12px rgba(90,62,75,0.06)',
    }}>
      {/* Pulse indicator */}
      {running && (
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#F0849C',
          animation: 'breathe 2s ease-in-out infinite',
          flexShrink: 0,
        }} />
      )}

      {/* Course name */}
      <button onClick={onOpenPanel} style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 11, fontWeight: 600, fontStyle: 'italic',
        color: '#5A3E4B', background: 'none', border: 'none',
        cursor: 'pointer', padding: 0,
        maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {course.split(/\s*[—\-·]\s*/)[0]}
      </button>

      {/* Time display */}
      <span style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 18, fontWeight: 700,
        color: running ? '#C88898' : '#5A3E4B',
        letterSpacing: '0.04em',
        minWidth: 60, textAlign: 'center',
        transition: 'color 0.3s',
      }}>
        {fmtTimeShort(elapsed)}
      </span>

      {/* Pause/Resume */}
      {running ? (
        <button onClick={pause} style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 9, fontWeight: 700, letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          color: '#5A3E4B', background: 'rgba(201,124,138,0.18)',
          border: '1px solid rgba(200,136,152,0.4)',
          cursor: 'pointer', padding: '3px 12px',
        }}>Pause</button>
      ) : (
        <button onClick={start} style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 9, fontWeight: 700, letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          color: '#5A3E4B', background: 'none',
          border: '1px solid rgba(240,160,180,0.35)',
          cursor: 'pointer', padding: '3px 12px',
        }}>Resume</button>
      )}

      {/* Log & done */}
      <button onClick={logAndReset} style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        color: '#80A880', background: 'none',
        border: '1px solid rgba(128,168,128,0.3)',
        cursor: 'pointer', padding: '3px 12px',
      }}>Log &amp; Done</button>
    </div>
  )
}