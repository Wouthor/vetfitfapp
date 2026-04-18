'use client'

interface ChatFitInputProps {
  value: string
  onChange: (value: string) => void
}

export default function ChatFitInput({ value, onChange }: ChatFitInputProps) {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-lg">💬</span>
        <label className="text-sm font-medium text-gray-300">
          ChatFit <span className="text-gray-500 font-normal">— optioneel</span>
        </label>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Beschrijf wat voor training je wil... bijv. 'Afwisselen tussen kracht en cardio, springtouwen en resistance bands gebruiken, regelmatig een rondje rennen'"
        rows={3}
        maxLength={500}
        className="input resize-none text-sm leading-relaxed"
        style={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
      />
      {value.length > 0 && (
        <p className="text-xs text-gray-500 mt-1 text-right">{value.length}/500</p>
      )}
    </div>
  )
}
