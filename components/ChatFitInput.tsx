'use client'

interface ChatFitInputProps {
  value: string
  onChange: (value: string) => void
}

export default function ChatFitInput({ value, onChange }: ChatFitInputProps) {
  return (
    <div>
      <label className="block font-label font-bold text-xs uppercase tracking-widest text-muted mb-2">
        Extra wensen <span className="normal-case tracking-normal font-normal text-faint">(optioneel)</span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Beschrijf wat voor training je wil... bijv. 'Afwisselen tussen kracht en cardio, springtouwen en resistance bands gebruiken, regelmatig een rondje rennen'"
        rows={3}
        maxLength={500}
        className="input resize-none text-sm leading-relaxed"
      />
      {value.length > 0 && (
        <p className="text-xs text-muted mt-1 text-right">{value.length}/500</p>
      )}
    </div>
  )
}
