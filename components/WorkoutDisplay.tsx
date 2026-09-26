'use client'

import { useState, useRef } from 'react'
import type { WorkoutContent, Exercise } from '@/lib/types'
import ExerciseTimer from '@/components/ExerciseTimer'

interface WorkoutDisplayProps {
  workout: WorkoutContent
  showKneeAlternatives: boolean
}

const sectionConfig = {
  warming_up: { label: 'Warming-up', short: 'Warming-up', num: '01' },
  hoofddeel: { label: 'Hoofddeel', short: 'Hoofddeel', num: '02' },
  cooling_down: { label: 'Cooling-down', short: 'Cool-down', num: '03' },
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
    return (
      <div className="flex items-center space-x-3">
        <div className="flex-1 h-1 bg-line">
          <div className="h-full bg-ink transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="font-label font-bold text-xs text-muted tracking-wider shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {current === -1 ? 0 : current + 1}/{total}
        </span>
      </div>
    )
  }

  // ── OVERZICHT: het trainingsschema ─────────────────────────────────
  if (current === -1) {
    return (
      <div className="space-y-3">
        <div
          className="bg-surface border border-line rounded-sm select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-ink text-paper rounded-t-sm">
            <span className="font-label font-bold text-sm uppercase tracking-widest">Trainingsschema</span>
            <span className="font-label font-bold text-xs uppercase tracking-widest text-rose">{total} oefeningen</span>
          </div>

          <div className="px-4">
            {([
              { key: 'warming_up' as SectionKey, section: workout.warming_up },
              { key: 'hoofddeel' as SectionKey, section: workout.hoofddeel },
              { key: 'cooling_down' as SectionKey, section: workout.cooling_down },
            ]).map(({ key, section }) => {
              if (!section?.oefeningen?.length) return null
              const cfg = sectionConfig[key]
              return (
                <div key={key} className="py-4 border-b border-line last:border-b-0">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="flex items-baseline">
                      <span className="font-display text-2xl leading-none text-brand mr-2">{cfg.num}</span>
                      <span className="font-display text-2xl leading-none uppercase">{cfg.label}</span>
                    </span>
                    <span className="sport-label">{section.duur}</span>
                  </div>
                  <ol>
                    {section.oefeningen.map((ex, i) => (
                      <li key={i} className="flex items-baseline py-2 border-t border-line/60 first:border-t-0">
                        <span className="font-label font-bold text-xs text-faint w-6 flex-shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium leading-snug">{ex.naam}</span>
                          {ex.duur_of_sets && <span className="block text-xs text-muted leading-snug mt-0.5">{ex.duur_of_sets}</span>}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )
            })}
          </div>

          <div className="p-4 pt-2">
            <button onClick={() => goTo(0)} className="btn-primary w-full flex items-center justify-between">
              <span>Start training</span>
              <span aria-hidden="true" className="text-lg leading-none">→</span>
            </button>
          </div>
        </div>

        <ProgressBar />
      </div>
    )
  }

  // ── OEFENING ─────────────────────────────────────────────────────
  const slide = slides[current]
  const config = sectionConfig[slide.sectionKey]
  const bullets = formatDescription(slide.exercise.beschrijving)

  return (
    <div className="space-y-3">
      <div className="grid gap-1" style={{ gridTemplateColumns: `auto repeat(${sectionTabs.length}, minmax(0, 1fr))` }}>
        <button
          onClick={() => goTo(-1)}
          className="px-3 py-2 rounded-sm font-label font-bold text-xs uppercase tracking-wider border border-line bg-surface text-muted hover:text-ink"
          aria-label="Terug naar trainingsschema"
        >
          Schema
        </button>
        {sectionTabs.map(({ key, start, count }) => {
          const cfg = sectionConfig[key]
          const active = current >= start && current < start + count
          return (
            <button
              key={key}
              onClick={() => goTo(start)}
              className={`py-2 px-1 rounded-sm font-label font-bold text-xs uppercase tracking-wider border transition-colors truncate ${
                active ? 'bg-ink border-ink text-paper' : 'bg-surface border-line text-muted hover:text-ink'
              }`}
            >
              {cfg.short}
            </button>
          )
        })}
      </div>

      <div
        className="bg-surface border border-line rounded-sm select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-line">
          <span className="font-label font-bold text-xs uppercase tracking-widest text-muted">
            {config.num} {config.label} · {slide.indexInSection + 1}/{slide.totalInSection}
          </span>
          <span className="font-label font-bold text-xs uppercase tracking-widest text-faint" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {current + 1}/{total}
          </span>
        </div>

        <div className="px-4 py-5">
          <h3 className="font-display text-4xl leading-none uppercase">{slide.exercise.naam}</h3>
          <p className="inline-block mt-3 font-label font-bold text-sm uppercase tracking-wider bg-blush text-ink px-2.5 py-1 rounded-sm break-words">
            {slide.exercise.duur_of_sets}
          </p>

          {bullets.length > 1 ? (
            <ul className="space-y-2 mt-4">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex items-start text-[15px] leading-snug">
                  <span className="mt-2 w-3 h-0.5 bg-ink flex-shrink-0 mr-3" aria-hidden="true" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[15px] leading-relaxed mt-4">{slide.exercise.beschrijving}</p>
          )}

          {showKneeAlternatives && slide.exercise.knie_vriendelijk_alternatief && (
            <div className="mt-5 border-l-4 border-rose bg-paper px-3 py-2.5">
              <p className="font-label font-bold text-xs uppercase tracking-widest text-berry">Knievriendelijk alternatief</p>
              <p className="text-sm mt-0.5">{slide.exercise.knie_vriendelijk_alternatief}</p>
            </div>
          )}

          {slide.exercise.timer && (
            <div className="mt-5">
              <ExerciseTimer
                key={`${current}-timer`}
                timer={slide.exercise.timer}
                onComplete={() => goTo(current + 1)}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 px-4 pb-4">
          <button
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            className="btn-secondary py-3 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Vorige
          </button>
          <button
            onClick={() => goTo(current + 1)}
            disabled={current === total - 1}
            className="btn-secondary py-3 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Volgende →
          </button>
        </div>
      </div>

      <ProgressBar />
    </div>
  )
}
