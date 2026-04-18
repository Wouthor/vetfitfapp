'use client'

import { useState, useRef } from 'react'
import type { WorkoutContent, Exercise } from '@/lib/types'
import ExerciseTimer from '@/components/ExerciseTimer'

interface WorkoutDisplayProps {
  workout: WorkoutContent
  showKneeAlternatives: boolean
}

const sectionConfig = {
  warming_up: {
    label: 'Warming-up',
    short: 'Warm',
    bg: 'bg-neon-950/80',
    border: 'border-neon-400/40',
    tag: 'bg-neon-900 text-neon-400',
    accent: 'text-neon-400',
    dot: 'bg-neon-400',
    emoji: '🔥',
  },
  hoofddeel: {
    label: 'Hoofddeel',
    short: 'Main',
    bg: 'bg-magenta-950/80',
    border: 'border-magenta-500/40',
    tag: 'bg-magenta-900 text-magenta-400',
    accent: 'text-magenta-400',
    dot: 'bg-magenta-500',
    emoji: '💪',
  },
  cooling_down: {
    label: 'Cooling-down',
    short: 'Cool',
    bg: 'bg-electric-950/80',
    border: 'border-electric-400/40',
    tag: 'bg-electric-900 text-electric-400',
    accent: 'text-electric-400',
    dot: 'bg-electric-400',
    emoji: '❄️',
  },
}

type SectionKey = keyof typeof sectionConfig

interface Slide {
  exercise: Exercise
  sectionKey: SectionKey
  indexInSection: number
  totalInSection: number
}

function formatDescription(text: string): string[] {
  if (!text) return []
  const lines = text
    .split(/\.\s+|\n+/)
    .map((l) => l.replace(/^[-•]\s*/, '').trim())
    .filter((l) => l.length > 2)
  return lines
}

export default function WorkoutDisplay({ workout, showKneeAlternatives }: WorkoutDisplayProps) {
  const [current, setCurrent] = useState(-1)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const slides: Slide[] = [
    ...(workout.warming_up?.oefeningen ?? []).map((ex, i, arr) => ({
      exercise: ex,
      sectionKey: 'warming_up' as SectionKey,
      indexInSection: i,
      totalInSection: arr.length,
    })),
    ...(workout.hoofddeel?.oefeningen ?? []).map((ex, i, arr) => ({
      exercise: ex,
      sectionKey: 'hoofddeel' as SectionKey,
      indexInSection: i,
      totalInSection: arr.length,
    })),
    ...(workout.cooling_down?.oefeningen ?? []).map((ex, i, arr) => ({
      exercise: ex,
      sectionKey: 'cooling_down' as SectionKey,
      indexInSection: i,
      totalInSection: arr.length,
    })),
  ]

  const total = slides.length
  const wuCount = workout.warming_up?.oefeningen?.length ?? 0
  const hdCount = workout.hoofddeel?.oefeningen?.length ?? 0
  const cdCount = workout.cooling_down?.oefeningen?.length ?? 0

  function goTo(index: number) {
    if (index >= -1 && index < total) setCurrent(index)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goTo(current + 1)
      else goTo(current - 1)
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  const sectionTabs: { key: SectionKey; start: number; count: number }[] = []
  if (wuCount > 0) sectionTabs.push({ key: 'warming_up', start: 0, count: wuCount })
  if (hdCount > 0) sectionTabs.push({ key: 'hoofddeel', start: wuCount, count: hdCount })
  if (cdCount > 0) sectionTabs.push({ key: 'cooling_down', start: wuCount + hdCount, count: cdCount })

  // ── VOORTGANGSBALK ────────────────────────────────────────────────
  function ProgressBar() {
    const progress = current === -1 ? 0 : ((current + 1) / total) * 100
    // Kleur op basis van huidige sectie
    const color = current === -1
      ? 'bg-void-border'
      : sectionConfig[slides[current].sectionKey].dot

    return (
      <div className="flex items-center space-x-2 px-1">
        <div className="flex-1 h-1.5 bg-void-input rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-[#ff99ff] tabular-nums shrink-0">
          {current === -1 ? '0' : current + 1}/{total}
        </span>
      </div>
    )
  }

  // ── OVERZICHT SLIDE ──────────────────────────────────────────────
  if (current === -1) {
    return (
      <div className="space-y-3">
        <div
          className="rounded-2xl border bg-void-card border-void-border select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-void-subtle">
            <span className="text-sm font-bold text-white">📋 Overzicht</span>
            <span className="text-xs text-[#ff99ff]">{total} oefeningen</span>
          </div>

          <div className="p-4 space-y-4">
            {([
              { key: 'warming_up' as SectionKey, section: workout.warming_up },
              { key: 'hoofddeel' as SectionKey, section: workout.hoofddeel },
              { key: 'cooling_down' as SectionKey, section: workout.cooling_down },
            ]).map(({ key, section }) => {
              if (!section?.oefeningen?.length) return null
              const cfg = sectionConfig[key]
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wide ${cfg.accent}`}>
                      {cfg.emoji} {cfg.label}
                    </span>
                    <span className="text-xs text-[#ff99ff]">{section.duur}</span>
                  </div>
                  <div className="space-y-1.5">
                    {section.oefeningen.map((ex, i) => (
                      <div key={i} className="flex items-center space-x-3 bg-void-input rounded-lg px-3 py-2">
                        <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${cfg.tag}`}>
                          {i + 1}
                        </span>
                        <span className="text-sm text-white flex-1 min-w-0 truncate">{ex.naam}</span>
                        <span className="text-xs text-[#ff99ff] shrink-0 max-w-[40%] text-right truncate">{ex.duur_of_sets}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="px-4 pb-4">
            <button
              onClick={() => goTo(0)}
              className="w-full py-3 rounded-xl bg-magenta-500 hover:bg-magenta-600 text-white font-bold text-sm transition-colors"
            >
              Start training →
            </button>
          </div>
        </div>

        <ProgressBar />
      </div>
    )
  }

  // ── OEFENING SLIDE ───────────────────────────────────────────────
  const slide = slides[current]
  const config = sectionConfig[slide.sectionKey]
  const bullets = formatDescription(slide.exercise.beschrijving)

  return (
    <div className="space-y-3">
      {/* Sectietabs — emoji + verkorte naam op mobiel */}
      <div className="flex space-x-1.5">
        <button
          onClick={() => goTo(-1)}
          className="py-2 px-3 rounded-xl text-xs font-semibold transition-all border bg-void-card border-void-border text-[#ff99ff] shrink-0"
        >
          📋
        </button>
        {sectionTabs.map(({ key, start, count }) => {
          const cfg = sectionConfig[key]
          const active = current >= start && current < start + count
          return (
            <button
              key={key}
              onClick={() => goTo(start)}
              className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all border ${
                active
                  ? `${cfg.bg} ${cfg.border} ${cfg.accent}`
                  : 'bg-void-card border-void-border text-[#ff99ff]'
              }`}
            >
              <span className="hidden sm:inline">{cfg.emoji} {cfg.label}</span>
              <span className="sm:hidden">{cfg.emoji} {cfg.short}</span>
            </button>
          )
        })}
      </div>

      <div
        className={`rounded-2xl border ${config.bg} ${config.border} select-none`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-void-subtle">
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-semibold uppercase tracking-wide ${config.accent}`}>
              {config.emoji} <span className="hidden sm:inline">{config.label}</span><span className="sm:hidden">{config.short}</span>
            </span>
            <span className="text-xs text-[#ff99ff]">
              {slide.indexInSection + 1}/{slide.totalInSection}
            </span>
          </div>
          <span className="text-xs text-[#ff99ff]">
            {current + 1} / {total}
          </span>
        </div>

        <div className="px-5 py-5">
          {/* Naam + duur_of_sets: naam bovenaan, badge eronder — voorkomt overflow */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white leading-tight mb-2">
              {slide.exercise.naam}
            </h3>
            <span className={`inline-block text-sm font-bold px-3 py-1.5 rounded-xl break-words ${config.tag}`}>
              {slide.exercise.duur_of_sets}
            </span>
          </div>

          {bullets.length > 1 ? (
            <ul className="space-y-2">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex items-start space-x-2 text-sm text-[#ffccff]">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#ffccff] leading-relaxed">{slide.exercise.beschrijving}</p>
          )}

          {showKneeAlternatives && slide.exercise.knie_vriendelijk_alternatief && (
            <div className="flex items-start space-x-2 mt-4 pt-4 border-t border-void-subtle">
              <span className="text-sm flex-shrink-0">🦵</span>
              <div>
                <span className="text-xs font-semibold text-electric-400 uppercase tracking-wide">Knie-alternatief </span>
                <span className="text-xs text-electric-300">{slide.exercise.knie_vriendelijk_alternatief}</span>
              </div>
            </div>
          )}

          {slide.exercise.timer && (
            <div className="mt-4">
              <ExerciseTimer
                key={`${current}-timer`}
                timer={slide.exercise.timer}
                onComplete={() => goTo(current + 1)}
              />
            </div>
          )}
        </div>

        {/* Navigatieknoppen */}
        <div className="flex items-center justify-between px-4 pb-4">
          <button
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            className="flex-1 py-3 rounded-xl bg-void-input hover:bg-void-border disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
          >
            ← Vorige
          </button>
          <button
            onClick={() => goTo(current + 1)}
            disabled={current === total - 1}
            className="flex-1 py-3 rounded-xl bg-void-input hover:bg-void-border disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
          >
            Volgende →
          </button>
        </div>
      </div>

      {/* Voortgangsbalk — vervangt de overlopende dots */}
      <ProgressBar />
    </div>
  )
}
