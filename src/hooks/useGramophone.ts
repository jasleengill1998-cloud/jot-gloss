import { useCallback, useEffect, useRef, useState } from 'react'

export type MoodKey = 'library' | 'night' | 'rain' | 'static' | 'courtyard' | 'dust'

interface Mood {
  key: MoodKey
  label: string
  file: string
}

const MOODS: Mood[] = [
  { key: 'library', label: 'Sunlight through the stacks', file: '/audio/sunlight-through-the-stacks.mp3' },
  { key: 'night', label: 'After hours', file: '/audio/the-lamp-stays-on.mp3' },
  { key: 'rain', label: 'The window seat', file: '/audio/the-window-seat.mp3' },
  { key: 'static', label: 'The B-side', file: '/audio/the-b-side.mp3' },
  { key: 'courtyard', label: 'The courtyard', file: '/audio/south-asian-lofi.mp3' },
  { key: 'dust', label: 'Dust and strings', file: '/audio/dust-and-strings.mp3' },
]

type GramophoneMode = 'audio' | 'synth' | null

type SynthLayer =
  | { kind: 'osc'; type: OscillatorType; frequency: number; gain: number; detune?: number }
  | { kind: 'noise'; filterType: BiquadFilterType; frequency: number; gain: number; q?: number }

const SYNTH_MIXES: Record<MoodKey, SynthLayer[]> = {
  library: [
    { kind: 'osc', type: 'sine', frequency: 196, gain: 0.14 },
    { kind: 'osc', type: 'triangle', frequency: 294, gain: 0.08, detune: 3 },
    { kind: 'noise', filterType: 'lowpass', frequency: 950, gain: 0.035, q: 0.7 },
  ],
  night: [
    { kind: 'osc', type: 'sine', frequency: 174, gain: 0.12 },
    { kind: 'osc', type: 'triangle', frequency: 261.63, gain: 0.06, detune: -4 },
    { kind: 'noise', filterType: 'lowpass', frequency: 620, gain: 0.02, q: 0.8 },
  ],
  rain: [
    { kind: 'osc', type: 'sine', frequency: 220, gain: 0.06 },
    { kind: 'noise', filterType: 'lowpass', frequency: 1200, gain: 0.065, q: 0.5 },
    { kind: 'noise', filterType: 'bandpass', frequency: 2200, gain: 0.018, q: 0.9 },
  ],
  static: [
    { kind: 'osc', type: 'sine', frequency: 185, gain: 0.1 },
    { kind: 'noise', filterType: 'highpass', frequency: 1800, gain: 0.12, q: 0.8 },
    { kind: 'noise', filterType: 'bandpass', frequency: 3200, gain: 0.05, q: 1.2 },
  ],
  courtyard: [
    { kind: 'osc', type: 'triangle', frequency: 220, gain: 0.16 },
    { kind: 'osc', type: 'sine', frequency: 329.63, gain: 0.09, detune: 5 },
    { kind: 'noise', filterType: 'lowpass', frequency: 1450, gain: 0.06, q: 0.6 },
  ],
  dust: [
    { kind: 'osc', type: 'sine', frequency: 146.83, gain: 0.18 },
    { kind: 'osc', type: 'triangle', frequency: 220, gain: 0.09, detune: -6 },
    { kind: 'noise', filterType: 'lowpass', frequency: 760, gain: 0.05, q: 0.7 },
  ],
}

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
  const [mood, setMood] = useState<Mood>(() => MOODS.find((item) => item.key === initialMood) ?? MOODS[0])
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolumeState] = useState(0.6)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const modeRef = useRef<GramophoneMode>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const synthMasterRef = useRef<GainNode | null>(null)
  const synthCleanupRef = useRef<(() => void) | null>(null)
  const noiseBufferRef = useRef<AudioBuffer | null>(null)

  const getAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current
    const el = new Audio()
    el.loop = true
    el.volume = 0.6
    audioRef.current = el
    return el
  }, [])

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null
    if (audioContextRef.current) return audioContextRef.current
    const AudioContextCtor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return null
    audioContextRef.current = new AudioContextCtor()
    return audioContextRef.current
  }, [])

  const getNoiseBuffer = useCallback((context: AudioContext) => {
    if (noiseBufferRef.current) return noiseBufferRef.current
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
    const channel = buffer.getChannelData(0)
    let last = 0
    for (let index = 0; index < channel.length; index += 1) {
      const white = Math.random() * 2 - 1
      last = (last + (0.02 * white)) / 1.02
      channel[index] = last * 3.5
    }
    noiseBufferRef.current = buffer
    return buffer
  }, [])

  const stopSynth = useCallback(() => {
    synthCleanupRef.current?.()
    synthCleanupRef.current = null
    synthMasterRef.current = null
    if (modeRef.current === 'synth') {
      modeRef.current = null
    }
  }, [])

  const startSynth = useCallback(async (nextMood: Mood) => {
    const context = getAudioContext()
    if (!context) {
      setError('No gramophone voice is available in this browser.')
      setPlaying(false)
      setLoading(false)
      return
    }

    stopSynth()

    if (context.state === 'suspended') {
      await context.resume()
    }

    const master = context.createGain()
    master.gain.setValueAtTime(0.0001, context.currentTime)
    master.connect(context.destination)
    synthMasterRef.current = master

    const disposers: Array<() => void> = []
    const noiseBuffer = getNoiseBuffer(context)

    for (const layer of SYNTH_MIXES[nextMood.key]) {
      if (layer.kind === 'osc') {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.type = layer.type
        oscillator.frequency.setValueAtTime(layer.frequency, context.currentTime)
        if (layer.detune) oscillator.detune.setValueAtTime(layer.detune, context.currentTime)
        gain.gain.setValueAtTime(layer.gain, context.currentTime)
        oscillator.connect(gain)
        gain.connect(master)
        oscillator.start()
        disposers.push(() => {
          oscillator.stop()
          oscillator.disconnect()
          gain.disconnect()
        })
      } else {
        const source = context.createBufferSource()
        const filter = context.createBiquadFilter()
        const gain = context.createGain()
        source.buffer = noiseBuffer
        source.loop = true
        filter.type = layer.filterType
        filter.frequency.setValueAtTime(layer.frequency, context.currentTime)
        if (layer.q) filter.Q.setValueAtTime(layer.q, context.currentTime)
        gain.gain.setValueAtTime(layer.gain, context.currentTime)
        source.connect(filter)
        filter.connect(gain)
        gain.connect(master)
        source.start()
        disposers.push(() => {
          source.stop()
          source.disconnect()
          filter.disconnect()
          gain.disconnect()
        })
      }
    }

    const targetVolume = Math.max(0.03, volume * 0.2)
    master.gain.linearRampToValueAtTime(targetVolume, context.currentTime + 0.45)

    synthCleanupRef.current = () => {
      const now = context.currentTime
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(master.gain.value, now)
      master.gain.linearRampToValueAtTime(0.0001, now + 0.18)
      window.setTimeout(() => {
        disposers.forEach((dispose) => {
          try {
            dispose()
          } catch {
            // Ignore node teardown races during quick mood changes.
          }
        })
        master.disconnect()
      }, 220)
    }

    modeRef.current = 'synth'
    setError(null)
    setLoading(false)
    setPlaying(true)
  }, [getAudioContext, getNoiseBuffer, stopSynth, volume])

  const stopPlayback = useCallback(() => {
    getAudio().pause()
    stopSynth()
    setPlaying(false)
  }, [getAudio, stopSynth])

  const loadMood = useCallback((nextMood: Mood, autoplay: boolean) => {
    const audio = getAudio()
    setError(null)
    setLoading(true)
    audio.pause()
    stopSynth()
    modeRef.current = 'audio'
    audio.src = nextMood.file
    audio.load()

    const onCanPlay = () => {
      setLoading(false)
      modeRef.current = 'audio'
      if (autoplay) {
        audio.play().then(() => setPlaying(true)).catch(() => {
          setError('The gramophone needs a clearer signal.')
          setPlaying(false)
        })
      }
    }

    const onError = () => {
      void startSynth(nextMood)
    }

    audio.addEventListener('canplaythrough', onCanPlay, { once: true })
    audio.addEventListener('error', onError, { once: true })
  }, [getAudio, startSynth, stopSynth])

  const setNeedle = useCallback(() => {
    const audio = getAudio()
    if (modeRef.current === 'synth') {
      void startSynth(mood)
      return
    }
    if (!audio.src || audio.src === window.location.href) {
      loadMood(mood, true)
      return
    }
    audio.play().then(() => setPlaying(true)).catch(() => {
      setError('The gramophone needs a clearer signal.')
      setPlaying(false)
    })
  }, [getAudio, loadMood, mood, startSynth])

  const liftNeedle = useCallback(() => {
    stopPlayback()
  }, [stopPlayback])

  const toggleNeedle = useCallback(() => {
    if (playing) liftNeedle()
    else setNeedle()
  }, [playing, liftNeedle, setNeedle])

  const selectMood = useCallback((key: MoodKey) => {
    const nextMood = MOODS.find((item) => item.key === key) ?? MOODS[0]
    setMood(nextMood)
    loadMood(nextMood, true)
  }, [loadMood])

  const setVolume = useCallback((nextVolume: number) => {
    const clamped = Math.max(0, Math.min(1, nextVolume))
    setVolumeState(clamped)
    getAudio().volume = clamped
    if (synthMasterRef.current && audioContextRef.current) {
      synthMasterRef.current.gain.setValueAtTime(Math.max(0.03, clamped * 0.2), audioContextRef.current.currentTime)
    }
  }, [getAudio])

  useEffect(() => () => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
    stopSynth()
    if (audioContextRef.current) {
      void audioContextRef.current.close()
      audioContextRef.current = null
    }
  }, [stopSynth])

  return {
    playing,
    loading,
    error,
    volume,
    mood,
    moods: MOODS,
    actionLabel: playing ? 'Pause' : 'Play',
    moodLabel: mood.label,
    setNeedle,
    liftNeedle,
    toggleNeedle,
    selectMood,
    setVolume,
  }
}
