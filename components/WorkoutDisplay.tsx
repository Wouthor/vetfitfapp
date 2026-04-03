'use client'

import { useState, useRef } from 'react'
import type { WorkoutContent, Exercise } from '@/lib/types'

interface WorkoutDisplayProps {
  workout: WorkoutContent
  showKneeAlternatives: boolean
}

const sectionConfig = {
  warming_up: {
    label: 'Warming-up',
    bg: 'bg-neon-950/80',
    border: 'border-neon-400/40',
    tag: 'bg-neon-900 text-neon-400',
    accent: 'text-neon-400',
    dot: 'bg-neon-400',
    emoji: '🔥',
  },
  hoofddeel: {
    label: 'Hoofddeel',
    bg: 'bg-magenta-950/80',
    border: 'border-magenta-500/40',
    tag: 'bg-magenta-900 text-magenta-400',
    accent: 'text-magenta-400',
    dot: 'bg-magenta-500',
    emoji: '💪',
  },
  cooling_down: {
    label: 'Cooling-down',
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
            <span className="text-xs text-[#4a5e8a]">{total} oefeningen</span>
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
                    <span className="text-xs text-[#4a5e8a]">{section.duur}</span>
                  </div>
                  <div className="space-y-1.5">
                    {section.oefeningen.map((ex, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 bg-void-input rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${cfg.tag}`}>
                            {i + 1}
                          </span>
                          <span className="text-sm text-white truncate">{ex.naam}</span>
                        </div>
                        <span className="text-xs text-[#4a5e8a] flex-shrink-0">{ex.duur_of_sets}</span>
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

        <div className="flex gap-1 flex-wrap justify-center px-2">
          <button className="rounded-full w-4 h-2 bg-[#7b8db8]" />
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className="rounded-full w-2 h-2 bg-void-border" />
          ))}
        </div>
      </div>
    )
  }

  // ── OEFENING SLIDE ───────────────────────────────────────────────
  const slide = slides[current]
  const config = sectionConfig[slide.sectionKey]
  const bullets = formatDescription(slide.exercise.beschrijving)

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => goTo(-1)}
          className="py-2 px-3 rounded-xl text-xs font-semibold transition-all border bg-void-card border-void-border text-[#4a5e8a]"
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
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all border ${
                active
                  ? `${cfg.bg} ${cfg.border} ${cfg.accent}`
                  : 'bg-void-card border-void-border text-[#4a5e8a]'
              }`}
            >
              {cfg.emoji} {cfg.label}
            </button>
          )
        })}
      </div>

      <div
        className={`rounded-2xl border ${config.bg} ${config.border} select-none`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-void-subtle">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold uppercase tracking-wide ${config.accent}`}>
              {config.emoji} {config.label}
            </span>
            <span className="text-xs text-[#4a5e8a]">
              {slide.indexInSection + 1}/{slide.totalInSection}
            </span>
          </div>
          <span className="text-xs text-[#4a5e8a]">
            {current + 1} / {total}
          </span>
        </div>

        <div className="px-5 py-5 min-h-56">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="text-xl font-bold text-white leading-tight">{slide.exercise.naam}</h3>
            <span className={`text-sm font-bold px-3 py-1.5 rounded-xl flex-shrink-0 ${config.tag}`}>
              {slide.exercise.duur_of_sets}
            </span>
          </div>

          {bullets.length > 1 ? (
            <ul className="space-y-2">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#7b8db8]">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#7b8db8] leading-relaxed">{slide.exercise.beschrijving}</p>
          )}

          {showKneeAlternatives && slide.exercise.knie_vriendelijk_alternatief && (
            <div className="flex items-start gap-2 mt-4 pt-4 border-t border-void-subtle">
              <span className="text-sm flex-shrink-0">🦵</span>
              <div>
                <span className="text-xs font-semibold text-electric-400 uppercase tracking-wide">Knie-alternatief </span>
                <span className="text-xs text-electric-300">{slide.exercise.knie_vriendelijk_alternatief}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 pb-4 gap-3">
          <button
            onClick={() => goTo(current - 1)}
            className="flex-1 py-2.5 rounded-xl bg-void-input hover:bg-void-border text-white font-semibold text-sm transition-colors"
          >
            ← Vorige
          </button>
          <button
            onClick={() => goTo(current + 1)}
            disabled={current === total - 1}
            className="flex-1 py-2.5 rounded-xl bg-void-input hover:bg-void-border disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
          >
            Volgende →
          </button>
        </div>
      </div>

      <div className="flex gap-1 flex-wrap justify-center px-2">
        <button onClick={() => goTo(-1)} className="rounded-full w-2 h-2 bg-[#4a5e8a]" />
        {slides.map((s, i) => {
          const cfg = sectionConfig[s.sectionKey]
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? `w-4 h-2 ${cfg.dot}`
                  : `w-2 h-2 ${i < current ? cfg.dot + ' opacity-60' : 'bg-void-border'}`
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
