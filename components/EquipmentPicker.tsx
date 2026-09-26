'use client'

import { EQUIPMENT_LIST } from '@/lib/equipment'

interface EquipmentPickerProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function EquipmentPicker({ selected, onChange }: EquipmentPickerProps) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div>
      <label className="block font-label font-bold text-xs uppercase tracking-widest text-muted mb-2">
        Beschikbaar materiaal
      </label>
      <div className="grid grid-cols-2 gap-2">
        {EQUIPMENT_LIST.map((item) => {
          const active = selected.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              aria-pressed={active}
              className={`flex items-center justify-between px-3 py-2.5 rounded-sm text-sm font-medium transition-colors text-left border-2 ${
                active
                  ? 'bg-blush border-ink text-ink'
                  : 'bg-surface border-line text-muted hover:border-ink hover:text-ink'
              }`}
            >
              <span className="truncate">{item.label}</span>
              {active && <span className="ml-2 flex-shrink-0" aria-hidden="true">✓</span>}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-muted mt-2">{selected.length} {selected.length === 1 ? 'item' : 'items'} geselecteerd</p>
      )}
    </div>
  )
}
