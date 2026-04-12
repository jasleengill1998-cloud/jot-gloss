/**
 * STUDY LEDGER — Calendar heatmap + usage metrics + per-subject breakdowns.
 *
 * Data sources:
 * - Timer session logs (localStorage) — primary study time data
 * - File activity (createdAt/updatedAt) — secondary activity signal
 *
 * Features:
 * - 12-week calendar heatmap (GitHub contribution style)
 * - Subject filter tabs
 * - Streak metrics (current, longest, most active day)
 * - Per-course breakdown bars
 * - Daily session log
 */
import { useState, useMemo } from 'react'
import { loadLog, fmtTime } from '../hooks/useStudyTimer'
import type { StudyFile } from '../types'

interface Props {
  classes: string[]
  files?: StudyFile[]
  onClose: () => void
}

/* ═══ PALETTE — wallpaper-matched intensity scales ═══ */
const COURSE_COLORS: Record<string, string[]> = {
  // [empty, light, medium, strong, intense]
  _all:      ['transparent', '#FFE4E8', '#FFB8C8', '#F0849C', '#D06878'],
  sage:      ['transparent', '#E6F2E8', '#C4E0C8', '#88C890', '#5CA868'],
  lavender:  ['transparent', '#EBE4F4', '#D0C0E8', '#B098D0', '#8870B0'],
  powder:    ['transparent', '#E4EEF8', '#B8D4F0', '#80B0D8', '#5890C0'],
  blush:     ['transparent', '#FFEAE6', '#F8C8C0', '#E8A098', '#D08078'],
}

const COURSE_PALETTE: Record<string, string> = {
  'MBAS 832': 'sage',
  'MBAS 811': 'lavender',
  'MBAS 801': 'powder',
  'General': 'blush',
}

function getCourseColorKey(courseName: string): string {
  for (const [prefix, key] of Object.entries(COURSE_PALETTE)) {
    if (courseName.includes(prefix)) return key
  }
  return 'blush'
}

/* ═══ DATE HELPERS ═══ */
function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function fmtDate(ds: string): string {
  const d = new Date(ds + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function fmtMonthShort(ds: string): string {
  const d = new Date(ds + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short' })
}

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* ═══ ACTIVITY MAP — merges timer + file data ═══ */
function buildActivityMap(
  log: { course: string; seconds: number; date: string }[],
  files: StudyFile[],
  courseFilter: string | null,
): Map<string, { seconds: number; fileOps: number }> {
  const map = new Map<string, { seconds: number; fileOps: number }>()

  // Timer sessions
  for (const entry of log) {
    if (courseFilter && !entry.course.includes(courseFilter)) continue
    const existing = map.get(entry.date) || { seconds: 0, fileOps: 0 }
    existing.seconds += entry.seconds
    map.set(entry.date, existing)
  }

  // File activity
  for (const file of files) {
    if (courseFilter && !file.className.includes(courseFilter)) continue
    for (const ts of [file.createdAt, file.updatedAt]) {
      const d = new Date(ts).toISOString().slice(0, 10)
      const existing = map.get(d) || { seconds: 0, fileOps: 0 }
      existing.fileOps += 1
      map.set(d, existing)
    }
  }

  return map
}

/* ═══ STREAK CALCULATOR ═══ */
function calcStreaks(activityMap: Map<string, { seconds: number; fileOps: number }>) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get sorted active dates
  const activeDates = new Set<string>()
  activityMap.forEach((val, date) => {
    if (val.seconds > 0 || val.fileOps > 0) activeDates.add(date)
  })

  // Current streak — count backwards from today
  let currentStreak = 0
  let d = new Date(today)
  while (activeDates.has(dateStr(d))) {
    currentStreak++
    d = addDays(d, -1)
  }
  // If no activity today, check if yesterday had activity (streak still alive)
  if (currentStreak === 0) {
    d = addDays(today, -1)
    while (activeDates.has(dateStr(d))) {
      currentStreak++
      d = addDays(d, -1)
    }
  }

  // Longest streak — scan all dates
  const sorted = Array.from(activeDates).sort()
  let longestStreak = 0
  let run = 0
  let prev: Date | null = null
  for (const ds of sorted) {
    const cur = new Date(ds + 'T00:00:00')
    if (prev && cur.getTime() - prev.getTime() === 86400000) {
      run++
    } else {
      run = 1
    }
    longestStreak = Math.max(longestStreak, run)
    prev = cur
  }

  // Most active day of week
  const dowTotals = [0, 0, 0, 0, 0, 0, 0]
  activityMap.forEach((val, date) => {
    const dow = new Date(date + 'T00:00:00').getDay()
    dowTotals[dow] += val.seconds
  })
  const maxDow = dowTotals.indexOf(Math.max(...dowTotals))
  const mostActiveDay = dowTotals[maxDow] > 0
    ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][maxDow]
    : 'None yet'

  return { currentStreak, longestStreak, mostActiveDay }
}

/* ═══ CALENDAR HEATMAP ═══ */
function CalendarHeatmap({ activityMap, colorKey }: {
  activityMap: Map<string, { seconds: number; fileOps: number }>
  colorKey: string
}) {
  const colors = COURSE_COLORS[colorKey] || COURSE_COLORS._all
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Build 12 weeks of dates (84 days ending today)
  // Find the Monday of 12 weeks ago
  const endDay = new Date(today)
  const startDay = addDays(endDay, -83)
  // Align to Monday
  const startDow = startDay.getDay()
  const mondayOffset = startDow === 0 ? -6 : 1 - startDow
  const gridStart = addDays(startDay, mondayOffset)

  // Compute max activity for scaling
  let maxActivity = 0
  activityMap.forEach(val => {
    const score = val.seconds + val.fileOps * 300 // weight file ops as ~5 min each
    if (score > maxActivity) maxActivity = score
  })

  // Build cells: 7 rows × N columns
  const weeks: { date: string; level: number; label: string }[][] = []
  let d = new Date(gridStart)
  while (d <= endDay) {
    const week: { date: string; level: number; label: string }[] = []
    for (let row = 0; row < 7; row++) {
      const ds = dateStr(d)
      const activity = activityMap.get(ds)
      let level = 0
      if (activity) {
        const score = activity.seconds + activity.fileOps * 300
        if (score > 0) {
          const ratio = maxActivity > 0 ? score / maxActivity : 0
          if (ratio > 0.75) level = 4
          else if (ratio > 0.5) level = 3
          else if (ratio > 0.25) level = 2
          else level = 1
        }
      }
      const timeStr = activity?.seconds ? fmtTime(activity.seconds) : ''
      const fileStr = activity?.fileOps ? `${activity.fileOps} file ops` : ''
      const label = `${fmtDate(ds)}${timeStr ? ` — ${timeStr}` : ''}${fileStr ? ` · ${fileStr}` : ''}`
      week.push({ date: ds, level, label })
      d = addDays(d, 1)
    }
    weeks.push(week)
  }

  // Month labels
  const monthLabels: { col: number; label: string }[] = []
  let lastMonth = ''
  weeks.forEach((week, col) => {
    const firstDay = week[0]?.date
    if (firstDay) {
      const m = fmtMonthShort(firstDay)
      if (m !== lastMonth) {
        monthLabels.push({ col, label: m })
        lastMonth = m
      }
    }
  })

  const cellSize = 14
  const cellGap = 3
  const labelWidth = 28

  return (
    <div style={{ overflowX: 'auto', padding: '4px 0' }}>
      {/* Month labels */}
      <div style={{ display: 'flex', paddingLeft: labelWidth, marginBottom: 2 }}>
        {monthLabels.map((ml, i) => (
          <span key={i} style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 9,
            fontStyle: 'italic',
            color: '#5A3E4B',
            position: 'absolute',
            left: labelWidth + ml.col * (cellSize + cellGap),
          }}>
            {ml.label}
          </span>
        ))}
      </div>
      <div style={{ position: 'relative', height: 14, marginBottom: 4 }} />

      {/* Grid */}
      <div style={{ display: 'flex', gap: 0 }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: cellGap, width: labelWidth, flexShrink: 0 }}>
          {DOW.map((day, i) => (
            <div key={day} style={{
              height: cellSize,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 10,
              color: 'rgba(90,62,75,0.6)',
              display: 'flex',
              alignItems: 'center',
              visibility: i % 2 === 0 ? 'visible' : 'hidden',
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div style={{ display: 'flex', gap: cellGap }}>
          {weeks.map((week, wIdx) => (
            <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: cellGap }}>
              {week.map((cell, rIdx) => (
                <div
                  key={rIdx}
                  title={cell.label}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: 2,
                    background: cell.level === 0
                      ? 'rgba(240,160,180,0.08)'
                      : colors[cell.level],
                    border: cell.date === getToday()
                      ? '1.5px solid #C88898'
                      : '0.5px solid rgba(200,136,152,0.1)',
                    cursor: cell.level > 0 ? 'pointer' : 'default',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => { if (cell.level > 0) (e.target as HTMLElement).style.transform = 'scale(1.3)' }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)' }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 10, color: 'rgba(90,62,75,0.6)', marginRight: 2 }}>Less</span>
        {[0, 1, 2, 3, 4].map(lvl => (
          <div key={lvl} style={{
            width: 10, height: 10, borderRadius: 2,
            background: lvl === 0 ? 'rgba(240,160,180,0.08)' : colors[lvl],
            border: '0.5px solid rgba(200,136,152,0.1)',
          }} />
        ))}
        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 10, color: 'rgba(90,62,75,0.6)', marginLeft: 2 }}>More</span>
      </div>
    </div>
  )
}

/* ═══ METRIC CARD ═══ */
function MetricCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: 'rgba(255,244,240,0.6)',
      border: '1px solid rgba(200,136,152,0.15)',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 22, fontWeight: 700, color: '#5A3E4B',
        lineHeight: 1.1,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
        textTransform: 'uppercase' as const,
        color: '#C88898', marginTop: 4,
      }}>
        {label}
      </div>
      {sub && (
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 10, fontStyle: 'italic', color: 'rgba(90,62,75,0.6)', marginTop: 2,
        }}>
          {sub}
        </div>
      )}
    </div>
  )
}

/* ═══ MAIN COMPONENT ═══ */
type Period = 'today' | 'week' | 'all'

export default function StudyStats({ classes, files = [], onClose }: Props) {
  const [period, setPeriod] = useState<Period>('week')
  const [courseFilter, setCourseFilter] = useState<string | null>(null)

  const log = useMemo(() => loadLog(), [])

  const today = getToday()
  const weekStart = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay())
    return d.toISOString().slice(0, 10)
  }, [])

  // Activity map for heatmap (always uses all time data)
  const activityMap = useMemo(
    () => buildActivityMap(log, files, courseFilter),
    [log, files, courseFilter]
  )

  // Filtered log for breakdown sections
  const filtered = useMemo(() => {
    let entries = log
    if (courseFilter) entries = entries.filter(e => e.course.includes(courseFilter))
    if (period === 'today') return entries.filter(e => e.date === today)
    if (period === 'week') return entries.filter(e => e.date >= weekStart)
    return entries
  }, [log, period, today, weekStart, courseFilter])

  const totalSeconds = filtered.reduce((sum, e) => sum + e.seconds, 0)

  // Streaks
  const streaks = useMemo(() => calcStreaks(activityMap), [activityMap])

  // Per-course breakdown
  const courseBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach(e => map.set(e.course, (map.get(e.course) || 0) + e.seconds))
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [filtered])

  // Per-day breakdown
  const dayBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach(e => map.set(e.date, (map.get(e.date) || 0) + e.seconds))
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtered])

  const maxCourseTime = Math.max(...courseBreakdown.map(([, s]) => s), 1)

  // Color key for heatmap
  const colorKey = courseFilter
    ? getCourseColorKey(classes.find(c => c.includes(courseFilter)) || '')
    : '_all'

  // Bar color per course
  function getCourseBarColor(courseName: string): string {
    const key = getCourseColorKey(courseName)
    return (COURSE_COLORS[key] || COURSE_COLORS._all)[3]
  }

  return (
    <div className="panel animate-slideDown" style={{
      padding: '20px 24px',
      marginBottom: 16,
    }}>
      {/* Inner border provided by .panel::before */}
      <div style={{
        display: 'none',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 13, fontWeight: 700, letterSpacing: '0.25em',
          textTransform: 'uppercase' as const, color: '#5A3E4B',
        }}>Study Ledger</span>
        <button onClick={onClose} style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 10, color: '#C88898', background: 'none', border: 'none', cursor: 'pointer',
          letterSpacing: '0.1em', textTransform: 'uppercase' as const,
        }}>close</button>
      </div>

      {/* Subject filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          className={`filter-chip ${courseFilter === null ? 'active' : ''}`}
          onClick={() => setCourseFilter(null)}
        >All</button>
        {classes.map(c => {
          const short = c.split(/\s*[—\-]\s*/)[0].trim()
          return (
            <button key={c}
              className={`filter-chip ${courseFilter && c.includes(courseFilter) ? 'active' : ''}`}
              onClick={() => setCourseFilter(courseFilter && c.includes(courseFilter) ? null : short)}
            >{short}</button>
          )
        })}
      </div>

      {/* ═══ CALENDAR HEATMAP ═══ */}
      <div style={{ marginBottom: 18 }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
          textTransform: 'uppercase' as const, color: '#5A3E4B', marginBottom: 8,
        }}>Activity</div>
        <CalendarHeatmap activityMap={activityMap} colorKey={colorKey} />
      </div>

      {/* ═══ STREAK METRICS ═══ */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8, marginBottom: 18,
      }}>
        <MetricCard label="Total" value={fmtTime(totalSeconds)} />
        <MetricCard label="Streak" value={`${streaks.currentStreak}d`} sub="current" />
        <MetricCard label="Best" value={`${streaks.longestStreak}d`} sub="longest" />
        <MetricCard label="Peak Day" value={streaks.mostActiveDay.slice(0, 3)} sub={streaks.mostActiveDay} />
      </div>

      {/* ═══ PERIOD SELECTOR ═══ */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {([['today', 'Today'], ['week', 'This Week'], ['all', 'All Time']] as const).map(([key, label]) => (
          <button key={key}
            className={`filter-chip ${period === key ? 'active' : ''}`}
            onClick={() => setPeriod(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ═══ PER-COURSE BREAKDOWN ═══ */}
      {courseBreakdown.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
            textTransform: 'uppercase' as const, color: '#5A3E4B', marginBottom: 8,
          }}>By Course</div>
          {courseBreakdown.map(([courseName, secs]) => {
            const pct = Math.round((secs / totalSeconds) * 100)
            const barWidth = Math.round((secs / maxCourseTime) * 100)
            const barColor = getCourseBarColor(courseName)
            return (
              <div key={courseName} style={{ marginBottom: 8 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  marginBottom: 3,
                }}>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 11, fontStyle: 'italic', color: '#5A3E4B',
                    maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {courseName.split(/\s*[—\-·]\s*/)[0]}
                  </span>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 10, color: '#C88898',
                  }}>
                    {fmtTime(secs)} ({pct}%)
                  </span>
                </div>
                <div style={{
                  height: 5, background: 'rgba(240,160,180,0.1)',
                  borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${barWidth}%`, height: '100%',
                    background: barColor,
                    borderRadius: 2,
                    transition: 'width 0.4s ease',
                    opacity: 0.7,
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ═══ DAILY LOG ═══ */}
      {period !== 'today' && dayBreakdown.length > 0 && (
        <div>
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
            textTransform: 'uppercase' as const, color: '#5A3E4B', marginBottom: 6,
          }}>Daily Log</div>
          {dayBreakdown.slice(0, 14).map(([date, secs]) => (
            <div key={date} style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 11, color: '#5A3E4B', padding: '4px 0',
              borderBottom: '1px solid rgba(240,160,180,0.08)',
            }}>
              <span style={{ fontStyle: 'italic' }}>{fmtDate(date)}</span>
              <span style={{ color: '#C88898', fontWeight: 600 }}>{fmtTime(secs)}</span>
            </div>
          ))}
          {dayBreakdown.length > 14 && (
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 9, fontStyle: 'italic', color: 'rgba(90,62,75,0.35)',
              textAlign: 'center', marginTop: 6,
            }}>
              + {dayBreakdown.length - 14} more days
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && activityMap.size === 0 && (
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 12, fontStyle: 'italic', color: 'rgba(90,62,75,0.35)',
          textAlign: 'center', padding: '16px 0',
        }}>
          No study sessions recorded {period === 'today' ? 'today' : period === 'week' ? 'this week' : 'yet'}.
          Use the timer to start tracking!
        </p>
      )}
    </div>
  )
}
