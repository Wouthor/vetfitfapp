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
    bg: 'bg-yellow-950/60',
    border: 'border-yellow-700/60',
    tag: 'bg-yellow-900 text-yellow-300',
    accent: 'text-yellow-400',
    dot: 'bg-yellow-400',
    emoji: '🔥',
  },
  hoofddeel: {
    label: 'Hoofddeel',
    bg: 'bg-orange-950/60',
    border: 'border-orange-700/60',
    tag: 'bg-orange-900 text-orange-300',
    accent: 'text-orange-400',
    dot: 'bg-orange-400',
    emoji: '💪',
  },
  cooling_down: {
    label: 'Cooling-down',
    bg: 'bg-blue-950/60',
    border: 'border-blue-700/60',
    tag: 'bg-blue-900 text-blue-300',
    accent: 'text-blue-400',
    dot: 'bg-blue-400',
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

// -1 = overzicht, 0..n-1 = oefening slides
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
          className="rounded-2xl border bg-gray-900/80 border-gray-700 select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <span className="text-sm font-bold text-white">📋 Overzicht</span>
            <span className="text-xs text-gray-500">{total} oefeningen</span>
          </div>

          {/* Sections summary */}
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
                    <span className="text-xs text-gray-500">{section.duur}</span>
                  </div>
                  <div className="space-y-1.5">
                    {section.oefeningen.map((ex, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 bg-gray-800/50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${cfg.tag}`}>
                            {i + 1}
                          </span>
                          <span className="text-sm text-white truncate">{ex.naam}</span>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{ex.duur_of_sets}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Start knop */}
          <div className="px-4 pb-4">
            <button
              onClick={() => goTo(0)}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-colors"
            >
              Start training →
            </button>
          </div>
        </div>

        {/* Dot: overzicht actief */}
        <div className="flex gap-1 flex-wrap justify-center px-2">
          <button className="rounded-full w-4 h-2 bg-gray-400" />
          {slides.map((s, i) => {
            const cfg = sectionConfig[s.sectionKey]
            return <button key={i} onClick={() => goTo(i)} className={`rounded-full w-2 h-2 bg-gray-700`} />
          })}
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
      {/* Section tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => goTo(-1)}
          className="py-2 px-3 rounded-xl text-xs font-semibold transition-all border bg-gray-900 border-gray-800 text-gray-500"
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
                  : 'bg-gray-900 border-gray-800 text-gray-500'
              }`}
            >
              {cfg.emoji} {cfg.label}
            </button>
          )
        })}
      </div>

      {/* Slide card */}
      <div
        className={`rounded-2xl border ${config.bg} ${config.border} select-none`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold uppercase tracking-wide ${config.accent}`}>
              {config.emoji} {config.label}
            </span>
            <span className="text-xs text-gray-600">
              {slide.indexInSection + 1}/{slide.totalInSection}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {current + 1} / {total}
          </span>
        </div>

        {/* Exercise content */}
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
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-300 leading-relaxed">{slide.exercise.beschrijving}</p>
          )}

          {showKneeAlternatives && slide.exercise.knie_vriendelijk_alternatief && (
            <div className="flex items-start gap-2 mt-4 pt-4 border-t border-gray-800">
              <span className="text-sm flex-shrink-0">🦵</span>
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Knie-alternatief </span>
                <span className="text-xs text-blue-300">{slide.exercise.knie_vriendelijk_alternatief}</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-4 pb-4 gap-3">
          <button
            onClick={() => goTo(current - 1)}
            className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-sm transition-colors"
          >
            ← Vorige
          </button>
          <button
            onClick={() => goTo(current + 1)}
            disabled={current === total - 1}
            className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
          >
            Volgende →
          </button>
        </div>
      </div>

      {/* Dot progress */}
      <div className="flex gap-1 flex-wrap justify-center px-2">
        {/* Overzicht dot */}
        <button onClick={() => goTo(-1)} className="rounded-full w-2 h-2 bg-gray-600" />
        {slides.map((s, i) => {
          const cfg = sectionConfig[s.sectionKey]
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? `w-4 h-2 ${cfg.dot}`
                  : `w-2 h-2 ${i < current ? cfg.dot + ' opacity-60' : 'bg-gray-700'}`
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
