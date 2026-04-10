'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ExerciseTimer as TimerData } from '@/lib/types'

interface ExerciseTimerProps {
  timer: TimerData
  onComplete: () => void
}

type Phase = 'idle' | 'work' | 'rest' | 'done'

function playTone(frequency: number, duration: number, volume = 0.8) {
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

function pingSingle(freq = 880) {
  playTone(freq, 0.18)
}

function pingDouble(freq = 880) {
  playTone(freq, 0.15)
  setTimeout(() => playTone(freq, 0.15), 220)
}

function pingTriple(freq = 1100) {
  playTone(freq, 0.15)
  setTimeout(() => playTone(freq, 0.15), 200)
  setTimeout(() => playTone(freq, 0.2), 400)
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
    pingSingle(880)
    setPhase('work')
    setCurrentRound(round)
    setSecondsLeft(workSeconds)
  }, [workSeconds])

  const startRest = useCallback(() => {
    pingDouble(660)
    setPhase('rest')
    setSecondsLeft(restSeconds)
  }, [restSeconds])

  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stopTimer()
          if (phase === 'work') {
            if (isInterval && currentRound < totalRounds) {
              startRest()
            } else if (isInterval && currentRound >= totalRounds) {
              pingTriple(1100)
              setPhase('done')
            } else {
              // simple timer, 1 round
              if (currentRound < totalRounds) {
                startWork(currentRound + 1)
              } else {
                pingTriple(1100)
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
  }, [phase, currentRound, totalRounds, isInterval, startRest, startWork, stopTimer])

  function handleStart() {
    pingSingle(880)
    startWork(1)
  }

  function handleReset() {
    stopTimer()
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

      <button
        onClick={handleReset}
        className="text-xs text-[#ff99ff] opacity-60 hover:opacity-100 transition-opacity"
      >
        Stoppen
      </button>
    </div>
  )
}
