'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ExerciseTimer as TimerData } from '@/lib/types'

interface ExerciseTimerProps {
  timer: TimerData
  onComplete: () => void
}

type Phase = 'idle' | 'work' | 'rest' | 'done'

let sharedAudioCtx: AudioContext | null = null

function getAudioCtx(): AudioContext {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return sharedAudioCtx
}

// Ontgrendelt de AudioContext tijdens een user gesture en geeft Promise terug
function initAudio(): Promise<void> {
  try {
    const ctx = getAudioCtx()
    // Speel een heel kort, zacht toontje — iOS vereist écht geluid om te ontgrendelen
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = 0.001 * Math.sin(i * 0.1)
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(ctx.destination)
    src.start(0)
    // Resume is async — wacht erop zodat tonen daarna zeker werken
    if (ctx.state === 'suspended') return ctx.resume()
  } catch {}
  return Promise.resolve()
}

function playTone(frequency: number, duration: number, volume = 1.0) {
  try {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  } catch {}
}

function playBellSynth(volume = 1.0) {
  try {
    const ctx = getAudioCtx()
    const harmonics: [number, number][] = [
      [880, 1.0],
      [1108, 0.6],
      [1318, 0.4],
      [1760, 0.25],
    ]
    harmonics.forEach(([freq, amp]) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(volume * amp, ctx.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 2.5)
    })
  } catch {}
}

function pingSingle() {
  playTone(880, 0.22, 1.0)
}

function pingDouble() {
  playTone(880, 0.22, 1.0)
  setTimeout(() => playTone(880, 0.22, 1.0), 220)
}

function pingEnd() {
  playBellSynth(1.0)
}

export default function ExerciseTimer({ timer, onComplete }: ExerciseTimerProps) {
  const totalRounds = timer.rounds ?? 1
  const workSeconds = timer.work_seconds
  const restSeconds = timer.rest_seconds ?? 0

  const [phase, setPhase] = useState<Phase>('idle')
  const [secondsLeft, setSecondsLeft] = useState(workSeconds)
  const [currentRound, setCurrentRound] = useState(1)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalSeconds = phase === 'rest' ? restSeconds : workSeconds
  const progress = secondsLeft / totalSeconds
  const isInterval = timer.type === 'interval' && restSeconds > 0

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startWork = useCallback((round: number) => {
    pingSingle()
    setPhase('work')
    setCurrentRound(round)
    setSecondsLeft(workSeconds)
  }, [workSeconds])

  const startRest = useCallback(() => {
    pingDouble()
    setPhase('rest')
    setSecondsLeft(restSeconds)
  }, [restSeconds])

  // Tick: alleen aftellen
  useEffect(() => {
    if (phase === 'idle' || phase === 'done' || paused) return

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => stopTimer()
  }, [phase, paused, stopTimer])

  // Transitie: reageer op secondsLeft === 0 (buiten state-updater, zodat audio werkt)
  useEffect(() => {
    if (secondsLeft !== 0 || phase === 'idle' || phase === 'done') return

    stopTimer()
    if (phase === 'work') {
      if (isInterval && currentRound < totalRounds) {
        startRest()
      } else {
        pingEnd()
        setPhase('done')
      }
    } else if (phase === 'rest') {
      startWork(currentRound + 1)
    }
  }, [secondsLeft, phase, currentRound, totalRounds, isInterval, startRest, startWork, stopTimer])

  function handleStart() {
    // Wacht tot AudioContext echt draait vóór eerste ping (kritiek op iOS)
    initAudio().then(() => startWork(1)).catch(() => startWork(1))
  }

  function handlePause() {
    if (paused) {
      setPaused(false)
    } else {
      stopTimer()
      setPaused(true)
    }
  }

  function handleReset() {
    stopTimer()
    setPaused(false)
    setPhase('idle')
    setCurrentRound(1)
    setSecondsLeft(workSeconds)
  }

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timeDisplay = mins > 0
    ? `${mins}:${secs.toString().padStart(2, '0')}`
    : `${secs}`

  const isWork = phase === 'work'
  const phaseLabel =
    phase === 'work' ? 'Werk' :
    phase === 'rest' ? 'Rust' :
    phase === 'done' ? 'Klaar' : ''

  // ── IDLE ────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <button
        onClick={handleStart}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-sm bg-ink text-paper hover:bg-ink-soft transition-colors"
      >
        <span className="text-left">
          <span className="block font-label font-bold text-sm uppercase tracking-wider">Start timer</span>
          <span className="block text-xs text-rose mt-0.5">
            {isInterval
              ? `${totalRounds} rondes · ${workSeconds}s werk / ${restSeconds}s rust`
              : `${workSeconds} seconden`}
          </span>
        </span>
        <span aria-hidden="true" className="w-9 h-9 rounded-full bg-paper text-ink flex items-center justify-center text-sm pl-0.5">▶</span>
      </button>
    )
  }

  // ── DONE ────────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="rounded-sm border-2 border-berry bg-blush px-4 py-4">
        <p className="font-display text-3xl uppercase text-berry leading-none">Oefening klaar</p>
        <div className="flex space-x-2 mt-4">
          <button onClick={handleReset} className="btn-secondary flex-1 py-2.5 text-sm">
            Opnieuw
          </button>
          <button onClick={onComplete} className="btn-primary flex-1 py-2.5 text-sm">
            Volgende →
          </button>
        </div>
      </div>
    )
  }

  // ── ACTIVE TIMER ────────────────────────────────────────────────────
  return (
    <div
      className={`rounded-sm px-4 pt-3 pb-4 transition-colors ${isWork ? 'bg-ink text-paper' : 'bg-blush text-ink'}`}
      role="timer"
      aria-live="off"
    >
      <div className="flex items-center justify-between">
        <span className={`font-label font-bold text-xs uppercase tracking-widest ${isWork ? 'text-rose' : 'text-berry'}`}>
          {phaseLabel}{paused ? ' · gepauzeerd' : ''}
        </span>
        {isInterval && (
          <span className={`font-label font-bold text-xs uppercase tracking-widest ${isWork ? 'text-rose' : 'text-berry'}`}>
            Ronde {currentRound}/{totalRounds}
          </span>
        )}
      </div>

      <p className="font-display text-8xl leading-none text-center mt-2 mb-3" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {timeDisplay}
      </p>

      <div className={`h-1.5 w-full ${isWork ? 'bg-ink-soft' : 'bg-paper'}`}>
        <div
          className={`h-full ${isWork ? 'bg-paper' : 'bg-berry'}`}
          style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%`, transition: 'width 0.9s linear' }}
        />
      </div>

      {isInterval && totalRounds > 1 && (
        <div className="grid mt-2" style={{ gridTemplateColumns: `repeat(${totalRounds}, minmax(0, 1fr))`, gridColumnGap: '4px' }}>
          {Array.from({ length: totalRounds }).map((_, i) => (
            <span
              key={i}
              className={`h-1 ${i < currentRound - 1 ? (isWork ? 'bg-paper' : 'bg-berry') : i === currentRound - 1 ? (isWork ? 'bg-rose' : 'bg-rose') : (isWork ? 'bg-ink-soft' : 'bg-paper')}`}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handlePause}
          className={`font-label font-bold text-sm uppercase tracking-wider px-5 py-2.5 rounded-sm transition-colors ${
            isWork ? 'bg-paper text-ink hover:bg-rose' : 'bg-ink text-paper hover:bg-ink-soft'
          }`}
        >
          {paused ? 'Hervat' : 'Pauze'}
        </button>
        <button
          onClick={handleReset}
          className={`font-label font-bold text-xs uppercase tracking-widest transition-colors ${isWork ? 'text-rose hover:text-paper' : 'text-berry hover:text-ink'}`}
        >
          Stoppen
        </button>
      </div>
    </div>
  )
}
