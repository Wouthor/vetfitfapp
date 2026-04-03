import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { WorkoutContent, WorkoutSection, Exercise } from '@/lib/types'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#f97316',
    paddingBottom: 12,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    backgroundColor: '#f97316',
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#6b7280',
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  sectionDuration: {
    fontSize: 10,
    color: '#6b7280',
    fontFamily: 'Helvetica-Oblique',
  },
  exerciseCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#f97316',
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    flex: 1,
  },
  exerciseSets: {
    fontSize: 10,
    color: '#f97316',
    fontFamily: 'Helvetica-Bold',
    marginLeft: 8,
  },
  exerciseDesc: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
    marginBottom: 4,
  },
  kneeAlt: {
    fontSize: 9,
    color: '#2563eb',
    borderTopWidth: 0.5,
    borderTopColor: '#dbeafe',
    paddingTop: 4,
    lineHeight: 1.4,
  },
  kneeLine: {
    fontSize: 9,
    color: '#3b82f6',
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
})

function ExercisePDF({ exercise }: { exercise: Exercise }) {
  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseRow}>
        <Text style={styles.exerciseName}>{exercise.naam}</Text>
        <Text style={styles.exerciseSets}>{exercise.duur_of_sets}</Text>
      </View>
      <Text style={styles.exerciseDesc}>{exercise.beschrijving}</Text>
      {exercise.knie_vriendelijk_alternatief && (
        <View style={styles.kneeAlt}>
          <Text>
            <Text style={styles.kneeLine}>Knie-alternatief: </Text>
            <Text style={styles.exerciseDesc}>{exercise.knie_vriendelijk_alternatief}</Text>
          </Text>
        </View>
      )}
    </View>
  )
}

function SectionPDF({ title, section }: { title: string; section: WorkoutSection }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionDuration}>{section.duur}</Text>
      </View>
      {section.oefeningen.map((ex, i) => (
        <ExercisePDF key={i} exercise={ex} />
      ))}
    </View>
  )
}

export function WorkoutPDFDocument({ workout, title }: { workout: WorkoutContent; title: string }) {
  const date = new Date().toLocaleDateString('nl-NL')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <Text style={styles.title}>{title || 'Bootcamp Training'}</Text>
          <Text style={styles.subtitle}>VetFitFapp · {date}</Text>
        </View>

        <SectionPDF title="🔥 Warming-up" section={workout.warming_up} />
        <SectionPDF title="💪 Hoofddeel" section={workout.hoofddeel} />
        <SectionPDF title="❄️ Cooling-down" section={workout.cooling_down} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>VetFitFapp App</Text>
          <Text style={styles.footerText}>{date}</Text>
        </View>
      </Page>
    </Document>
  )
}
