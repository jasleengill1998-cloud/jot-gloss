import { useCallback, useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Mood → file mapping                                               */
/* ------------------------------------------------------------------ */

export type MoodKey = 'library' | 'night' | 'rain'

interface Mood {
  key: MoodKey
  label: string
  file: string
}

const MOODS: Mood[] = [
  { key: 'library', label: 'The reading hour', file: '/audio/the-reading-hour.mp3' },
  { key: 'night',   label: 'Past midnight',    file: '/audio/past-midnight.mp3' },
  { key: 'rain',    label: 'Rain on glass',    file: '/audio/rain-on-glass.mp3' },
]

/* ------------------------------------------------------------------ */
/*  Hook return type                                                  */
/* ------------------------------------------------------------------ */

export interface GramophoneState {
  /** Is audio currently playing? */
  playing: boolean
  /** Is audio source still loading? */
  loading: boolean
  /** Error message when a track can't play (e.g. file missing) */
  error: string | null
  /** Current volume 0-1 */
  volume: number
  /** The active mood */
  mood: Mood
  /** All available moods */
  moods: Mood[]
  /** Human label: "Set the needle" or "Lift the needle" */
  actionLabel: string
  /** Human label for the current mood, e.g. "The reading hour" */
  moodLabel: string

  /** Start playing the current mood */
  setNeedle: () => void
  /** Pause playback */
  liftNeedle: () => void
  /** Toggle play / pause */
  toggleNeedle: () => void
  /** Switch to a different mood (starts playing automatically) */
  selectMood: (key: MoodKey) => void
  /** Set volume 0-1 */
  setVolume: (v: number) => void
}

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */

export function useGramophone(initialMood: MoodKey = 'library'): GramophoneState {
  const [mood, setMood] = useState<Mood>(() => MOODS.find((m) => m.key === initialMood) ?? MOODS[0])
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolumeState] = useState(0.6)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  /* ---- lazy-create a single <audio> element ---- */
  const getAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current
    const el = new Audio()
    el.loop = true
    el.volume = 0.6
    audioRef.current = el
    return el
  }, [])

  /* ---- keep audio element in sync with mood ---- */
  const loadMood = useCallback(
    (m: Mood, autoplay: boolean) => {
      const audio = getAudio()
      setError(null)
      setLoading(true)

      audio.pause()
      audio.src = m.file
      audio.load()

      const onCanPlay = () => {
        setLoading(false)
        if (autoplay) {
          audio.play().then(() => setPlaying(true)).catch(() => {
            setError('The ink has run — try again')
            setPlaying(false)
          })
        }
        audio.removeEventListener('canplaythrough', onCanPlay)
      }

      const onError = () => {
        setLoading(false)
        setError('The ink has run — try again')
        setPlaying(false)
        audio.removeEventListener('error', onError)
      }

      audio.addEventListener('canplaythrough', onCanPlay, { once: true })
      audio.addEventListener('error', onError, { once: true })
    },
    [getAudio],
  )

  /* ---- transport controls ---- */
  const setNeedle = useCallback(() => {
    const audio = getAudio()
    if (!audio.src || audio.src === window.location.href) {
      loadMood(mood, true)
      return
    }
    audio.play().then(() => setPlaying(true)).catch(() => {
      setError('The ink has run — try again')
      setPlaying(false)
    })
  }, [getAudio, loadMood, mood])

  const liftNeedle = useCallback(() => {
    const audio = getAudio()
    audio.pause()
    setPlaying(false)
  }, [getAudio])

  const toggleNeedle = useCallback(() => {
    if (playing) liftNeedle()
    else setNeedle()
  }, [playing, liftNeedle, setNeedle])

  const selectMood = useCallback(
    (key: MoodKey) => {
      const m = MOODS.find((x) => x.key === key) ?? MOODS[0]
      setMood(m)
      loadMood(m, true)
    },
    [loadMood],
  )

  const setVolume = useCallback(
    (v: number) => {
      const clamped = Math.max(0, Math.min(1, v))
      setVolumeState(clamped)
      const audio = getAudio()
      audio.volume = clamped
    },
    [getAudio],
  )

  /* ---- cleanup on unmount ---- */
  useEffect(() => {
    return () => {
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.src = ''
        audioRef.current = null
      }
    }
  }, [])

  return {
    playing,
    loading,
    error,
    volume,
    mood,
    moods: MOODS,
    actionLabel: playing ? 'Lift the needle' : 'Set the needle',
    moodLabel: mood.label,
    setNeedle,
    liftNeedle,
    toggleNeedle,
    selectMood,
    setVolume,
  }
}
