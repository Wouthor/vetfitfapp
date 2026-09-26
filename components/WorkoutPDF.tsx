import React from 'react'
import path from 'path'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { WorkoutContent, WorkoutSection, Exercise } from '@/lib/types'
import { splitTitle } from '@/lib/format'

// Zelfde lettertypen als de app; de bestanden komen uit de @fontsource-pakketten
const fontFile = (pkg: string, file: string) => path.join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files', file)

Font.register({ family: 'Anton', src: fontFile('anton', 'anton-latin-400-normal.woff') })
Font.register({
  family: 'Archivo',
  fonts: [
    { src: fontFile('archivo', 'archivo-latin-400-normal.woff'), fontWeight: 400 },
    { src: fontFile('archivo', 'archivo-latin-500-normal.woff'), fontWeight: 500 },
    { src: fontFile('archivo', 'archivo-latin-700-normal.woff'), fontWeight: 700 },
  ],
})
Font.register({
  family: 'Archivo Narrow',
  fonts: [
    { src: fontFile('archivo-narrow', 'archivo-narrow-latin-500-normal.woff'), fontWeight: 500 },
    { src: fontFile('archivo-narrow', 'archivo-narrow-latin-700-normal.woff'), fontWeight: 700 },
  ],
})
// Geen automatische afbreekstreepjes midden in woorden
Font.registerHyphenationCallback((word) => [word])

const C = {
  ink: '#2a0b22',
  inkSoft: '#4d1b40',
  brand: '#d4006f',
  muted: '#7d5a6d',
  faint: '#a98c9b',
  rose: '#f39ac8',
  blush: '#fde2ef',
  berry: '#a3125f',
  line: '#e0cdd6',
  paper: '#f7f1f3',
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 66,
    paddingBottom: 48,
    paddingHorizontal: 0,
    fontFamily: 'Archivo',
    fontSize: 10,
    color: C.ink,
    backgroundColor: '#ffffff',
  },
  band: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 46,
    backgroundColor: C.ink,
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordmark: { fontFamily: 'Anton', fontSize: 20, lineHeight: 1.2, color: C.paper, letterSpacing: 1 },
  bandLabel: { fontFamily: 'Archivo Narrow', fontWeight: 700, fontSize: 8, color: C.rose, letterSpacing: 1.5, textTransform: 'uppercase' },
  body: { paddingHorizontal: 40 },
  eyebrow: { fontFamily: 'Archivo Narrow', fontWeight: 700, fontSize: 8, color: C.muted, letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { fontFamily: 'Anton', fontSize: 38, lineHeight: 1, textTransform: 'uppercase', marginTop: 6 },
  stats: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: C.ink,
    marginTop: 14,
    marginBottom: 16,
  },
  stat: { flex: 1, paddingVertical: 7 },
  statDivided: { flex: 1, paddingVertical: 7, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: C.line },
  statValue: { fontFamily: 'Anton', fontSize: 20, lineHeight: 1, textTransform: 'capitalize' },
  statLabel: { fontFamily: 'Archivo Narrow', fontWeight: 700, fontSize: 7.5, color: C.muted, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 3 },
  section: { marginBottom: 12 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: C.ink,
    paddingBottom: 4,
    marginBottom: 2,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'flex-end' },
  sectionNum: { fontFamily: 'Anton', fontSize: 18, color: C.brand, marginRight: 6, lineHeight: 1 },
  sectionTitle: { fontFamily: 'Anton', fontSize: 18, textTransform: 'uppercase', lineHeight: 1 },
  sectionDuration: { fontFamily: 'Archivo Narrow', fontWeight: 700, fontSize: 8, color: C.muted, letterSpacing: 1.2, textTransform: 'uppercase' },
  exercise: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: C.line,
  },
  exNum: { width: 18, fontFamily: 'Archivo Narrow', fontWeight: 700, fontSize: 9, color: C.faint, paddingTop: 1 },
  exBody: { flex: 1 },
  exHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  exName: { flex: 1, fontWeight: 700, fontSize: 11, lineHeight: 1.25, paddingRight: 8 },
  exSets: {
    maxWidth: '42%',
    fontFamily: 'Archivo Narrow',
    fontWeight: 700,
    fontSize: 8.5,
    backgroundColor: C.blush,
    paddingHorizontal: 5,
    paddingVertical: 2,
    textAlign: 'right',
  },
  bulletRow: { flexDirection: 'row', marginTop: 1.5 },
  bulletDash: { width: 7, height: 1, backgroundColor: C.ink, marginTop: 5, marginRight: 6 },
  bulletText: { flex: 1, fontSize: 9.5, lineHeight: 1.3, color: C.inkSoft },
  knee: {
    marginTop: 3,
    borderLeftWidth: 2,
    borderLeftColor: C.rose,
    paddingLeft: 6,
  },
  kneeLabel: { fontFamily: 'Archivo Narrow', fontWeight: 700, fontSize: 7.5, color: C.berry, letterSpacing: 1.2, textTransform: 'uppercase' },
  kneeText: { fontSize: 9, lineHeight: 1.3, color: C.inkSoft },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: C.line,
    paddingTop: 6,
  },
  footerText: { fontFamily: 'Archivo Narrow', fontWeight: 500, fontSize: 7.5, color: C.faint, letterSpacing: 1, textTransform: 'uppercase' },
})

// De webfonts bevatten geen emoji of pijltekens; vervang wat Claude soms in namen zet
function clean(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/↳\s*/g, '› ')
    .replace(/[→⟶]/g, '–')
    .replace(new RegExp('[\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{FE0F}\\u{200D}]', 'gu'), '')
    .trim()
}

function toBullets(text: string): string[] {
  return clean(text)
    .split(/\.\s+|\n+/)
    .map((l) => l.replace(/^[-•]\s*/, '').replace(/\.$/, '').trim())
    .filter((l) => l.length > 2)
}

function ExercisePDF({ exercise, index, showKnee }: { exercise: Exercise; index: number; showKnee: boolean }) {
  const bullets = toBullets(exercise.beschrijving)
  return (
    <View style={styles.exercise} wrap={false}>
      <Text style={styles.exNum}>{index + 1}</Text>
      <View style={styles.exBody}>
        <View style={styles.exHeadRow}>
          <Text style={styles.exName}>{clean(exercise.naam)}</Text>
          {exercise.duur_of_sets ? <Text style={styles.exSets}>{clean(exercise.duur_of_sets)}</Text> : null}
        </View>
        {bullets.map((b, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={styles.bulletDash} />
            <Text style={styles.bulletText}>{b}</Text>
          </View>
        ))}
        {showKnee && exercise.knie_vriendelijk_alternatief ? (
          <View style={styles.knee}>
            <Text style={styles.kneeText}>
              <Text style={styles.kneeLabel}>KNIE  </Text>
              {clean(exercise.knie_vriendelijk_alternatief)}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

function SectionPDF({ num, title, section, showKnee }: { num: string; title: string; section?: WorkoutSection; showKnee: boolean }) {
  if (!section?.oefeningen?.length) return null
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead} wrap={false} minPresenceAhead={60}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionNum}>{num}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Text style={styles.sectionDuration}>{clean(section.duur)}</Text>
      </View>
      {section.oefeningen.map((ex, i) => (
        <ExercisePDF key={i} exercise={ex} index={i} showKnee={showKnee} />
      ))}
    </View>
  )
}

export function WorkoutPDFDocument({
  workout,
  title,
  duration,
  intensity,
  showKnee = true,
}: {
  workout: WorkoutContent
  title: string
  duration?: number
  intensity?: string
  showKnee?: boolean
}) {
  const { name, date } = splitTitle(title)
  const dateLabel = date ?? new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' })
  const exerciseCount =
    (workout.warming_up?.oefeningen?.length ?? 0) +
    (workout.hoofddeel?.oefeningen?.length ?? 0) +
    (workout.cooling_down?.oefeningen?.length ?? 0)

  const stats = [
    ...(duration ? [{ value: String(duration), label: 'minuten' }] : []),
    ...(intensity ? [{ value: intensity, label: 'intensiteit' }] : []),
    { value: String(exerciseCount), label: 'oefeningen' },
  ]

  return (
    <Document title={clean(name)} author="VetFit">
      <Page size="A4" style={styles.page}>
        <View style={styles.band} fixed>
          <Text style={styles.wordmark}>VETFIT</Text>
          <Text style={styles.bandLabel}>Bootcamp · trainingsschema</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.eyebrow}>{dateLabel}</Text>
          <Text style={styles.title}>{clean(name)}</Text>

          <View style={styles.stats}>
            {stats.map((s, i) => (
              <View key={s.label} style={i === 0 ? styles.stat : styles.statDivided}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <SectionPDF num="01" title="Warming-up" section={workout.warming_up} showKnee={showKnee} />
          <SectionPDF num="02" title="Hoofddeel" section={workout.hoofddeel} showKnee={showKnee} />
          <SectionPDF num="03" title="Cooling-down" section={workout.cooling_down} showKnee={showKnee} />
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>VetFit · {clean(name)}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} van ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
