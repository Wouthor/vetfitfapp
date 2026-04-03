'use client'

import { useState } from 'react'
import type { WorkoutContent } from '@/lib/types'

interface PDFExportButtonProps {
  workout: WorkoutContent
  title: string
}

export default function PDFExportButton({ workout, title }: PDFExportButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workout, title }),
      })

      if (!res.ok) throw new Error('PDF generatie mislukt')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title || 'training'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('PDF exporteren mislukt. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="btn-secondary flex items-center gap-2 justify-center"
    >
      {loading ? (
        <>
          <span className="animate-spin">⟳</span> PDF maken...
        </>
      ) : (
        <>
          <span>📄</span> Exporteer PDF
        </>
      )}
    </button>
  )
}
