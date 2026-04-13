import { useCallback, useEffect, useRef, useState } from 'react'

export type MoodKey = 'library' | 'night' | 'rain' | 'static' | 'courtyard' | 'dust'

interface Mood {
  key: MoodKey
  label: string
  file: string
}

const MOODS: Mood[] = [
  { key: 'library',   label: 'Sunlight through the stacks', file: '/audio/sunlight-through-the-stacks.mp3' },
  { key: 'night',     label: 'After hours',                 file: '/audio/the-lamp-stays-on.mp3' },
  { key: 'rain',      label: 'The window seat',             file: '/audio/the-window-seat.mp3' },
  { key: 'static',    label: 'The B-side',                  file: '/audio/the-b-side.mp3' },
  { key: 'courtyard', label: 'The courtyard',               file: '/audio/south-asian-lofi.mp3' },
  { key: 'dust',      label: 'Dust and strings',            file: '/audio/dust-and-strings.mp3' },
]

export interface GramophoneState {
  playing: boolean
  loading: boolean
  error: string | null
  volume: number
  mood: Mood
  moods: Mood[]
  actionLabel: string
  moodLabel: string
  setNeedle: () => void
  liftNeedle: () => void
  toggleNeedle: () => void
  selectMood: (key: MoodKey) => void
  setVolume: (v: number) => void
}

export function useGramophone(initialMood: MoodKey = 'library'): GramophoneState {
  const [mood, setMood] = useState<Mood>(() => MOODS.find((m) => m.key === initialMood) ?? MOODS[0])
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolumeState] = useState(0.6)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const getAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current
    const el = new Audio()
    el.loop = true
    el.volume = 0.6
    audioRef.current = el
    return el
  }, [])

  const loadMood = useCallback((m: Mood, autoplay: boolean) => {
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
    }
    const onError = () => {
      setLoading(false)
      setError('The ink has run — try again')
      setPlaying(false)
    }
    audio.addEventListener('canplaythrough', onCanPlay, { once: true })
    audio.addEventListener('error', onError, { once: true })
  }, [getAudio])

  const setNeedle = useCallback(() => {
    const audio = getAudio()
    if (!audio.src || audio.src === window.location.href) { loadMood(mood, true); return }
    audio.play().then(() => setPlaying(true)).catch(() => {
      setError('The ink has run — try again')
      setPlaying(false)
    })
  }, [getAudio, loadMood, mood])

  const liftNeedle = useCallback(() => { getAudio().pause(); setPlaying(false) }, [getAudio])
  const toggleNeedle = useCallback(() => { if (playing) liftNeedle(); else setNeedle() }, [playing, liftNeedle, setNeedle])

  const selectMood = useCallback((key: MoodKey) => {
    const m = MOODS.find((x) => x.key === key) ?? MOODS[0]
    setMood(m)
    loadMood(m, true)
  }, [loadMood])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    setVolumeState(clamped)
    getAudio().volume = clamped
  }, [getAudio])

  useEffect(() => () => {
    const audio = audioRef.current
    if (audio) { audio.pause(); audio.src = ''; audioRef.current = null }
  }, [])

  return {
    playing, loading, error, volume, mood, moods: MOODS,
    actionLabel: playing ? 'Lift the needle' : 'Set the needle',
    moodLabel: mood.label, setNeedle, liftNeedle, toggleNeedle, selectMood, setVolume,
  }
}
