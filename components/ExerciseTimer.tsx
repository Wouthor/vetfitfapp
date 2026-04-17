'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ExerciseTimer as TimerData } from '@/lib/types'

interface ExerciseTimerProps {
  timer: TimerData
  onComplete: () => void
}

type Phase = 'idle' | 'work' | 'rest' | 'done'

function playTone(frequency: number, duration: number, volume = 1.0) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
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

// Bell sound: meerdere harmonics met lange uitklank (echt bel-gevoel)
function playBell(volume = 1.0) {
  // Probeer eerst een eigen geluidsbestand (public/bell.mp3)
  try {
    const audio = new Audio('/bell.mp3')
    audio.volume = volume
    const p = audio.play()
    if (p !== undefined) {
      p.then(() => { /* gelukt */ }).catch(() => {
        // Geen bestand gevonden — val terug op synthesizer
        playBellSynth(volume)
      })
    }
    return
  } catch {}
  playBellSynth(volume)
}

function playBellSynth(volume = 1.0) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    // Bel bestaat uit grondtoon + harmonics
    const harmonics: [number, number][] = [
      [880, 1.0],   // A5 — grondtoon
      [1108, 0.6],  // C#6
      [1318, 0.4],  // E6
      [1760, 0.25], // A6 — octaaf
    ]
    harmonics.forEach(([freq, amp], i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      // Snelle aanslag, lange uitklank (2.5s)
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(volume * amp, ctx.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 2.5)
    })
  } catch {}
}

function playPing(volume = 1.0) {
  // Probeer eerst public/ping.mp3
  try {
    const audio = new Audio('/ping.mp3')
    audio.volume = volume
    const p = audio.play()
    if (p !== undefined) {
      p.catch(() => playTone(880, 0.22, volume))
    }
    return
  } catch {}
  playTone(880, 0.22, volume)
}

function pingSingle() {
  playPing(1.0)
}

function pingDouble() {
  playPing(1.0)
  setTimeout(() => playPing(1.0), 220)
}

function pingEnd() {
  playBell(1.0)
}

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

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

  useEffect(() => {
    if (phase === 'idle' || phase === 'done' || paused) return

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stopTimer()
          if (phase === 'work') {
            if (isInterval && currentRound < totalRounds) {
              startRest()
            } else if (isInterval && currentRound >= totalRounds) {
              pingEnd()
              setPhase('done')
            } else {
              // simple timer, 1 round
              if (currentRound < totalRounds) {
                startWork(currentRound + 1)
              } else {
                pingEnd()
                setPhase('done')
              }
            }
          } else if (phase === 'rest') {
            startWork(currentRound + 1)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => stopTimer()
  }, [phase, paused, currentRound, totalRounds, isInterval, startRest, startWork, stopTimer])

  function handleStart() {
    pingSingle()
    startWork(1)
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

  const strokeColor =
    phase === 'rest' ? '#00ffff' :
    phase === 'done' ? '#00ff88' :
    '#ff00ff'

  const bgColor =
    phase === 'rest' ? 'border-electric-400/40 bg-electric-950/60' :
    phase === 'done' ? 'border-green-500/40 bg-green-950/40' :
    'border-magenta-500/40 bg-magenta-950/60'

  const phaseLabel =
    phase === 'work' ? 'WERK' :
    phase === 'rest' ? 'RUST' :
    phase === 'done' ? 'KLAAR' : ''

  // ── IDLE ────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <button
        onClick={handleStart}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-magenta-500/60 bg-magenta-950/40 hover:bg-magenta-900/60 transition-colors"
      >
        <span className="text-2xl">▶</span>
        <div className="text-left">
          <p className="font-bold text-white text-sm">Start timer</p>
          <p className="text-xs text-magenta-300">
            {isInterval
              ? `${totalRounds}× ${workSeconds}s werk / ${restSeconds}s rust`
              : `${workSeconds} seconden`}
          </p>
        </div>
      </button>
    )
  }

  // ── DONE ────────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center gap-3 py-4 rounded-2xl border border-green-500/40 bg-green-950/40">
        <p className="text-4xl">✓</p>
        <p className="font-bold text-green-400">Oefening klaar!</p>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl border border-void-border text-[#ff99ff] text-sm"
          >
            Opnieuw
          </button>
          <button
            onClick={onComplete}
            className="px-5 py-2 rounded-xl bg-magenta-500 hover:bg-magenta-600 text-white font-bold text-sm transition-colors"
          >
            Volgende →
          </button>
        </div>
      </div>
    )
  }

  // ── ACTIVE TIMER ────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col items-center gap-3 py-5 rounded-2xl border ${bgColor} transition-colors`}>
      {isInterval && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#ff99ff] uppercase tracking-wide">
            Ronde {currentRound} / {totalRounds}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            phase === 'rest' ? 'bg-electric-900 text-electric-400' : 'bg-magenta-900 text-magenta-400'
          }`}>
            {phaseLabel}
          </span>
        </div>
      )}

      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#1a001a" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={RADIUS}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white tabular-nums">{timeDisplay}</span>
          {!isInterval && (
            <span className="text-xs text-[#ff99ff] mt-0.5">{phaseLabel}</span>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <button
          onClick={handlePause}
          className={`px-5 py-2 rounded-xl border font-semibold text-sm transition-colors ${
            paused
              ? 'border-magenta-500 bg-magenta-900/40 text-magenta-400 hover:bg-magenta-900/60'
              : 'border-void-border bg-void-input text-white hover:bg-void-border'
          }`}
        >
          {paused ? '▶ Hervat' : '⏸ Pauze'}
        </button>
        <button
          onClick={handleReset}
          className="text-xs text-[#ff99ff] opacity-60 hover:opacity-100 transition-opacity"
        >
          Stoppen
        </button>
      </div>
    </div>
  )
}
