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
      <label className="block text-sm font-medium text-gray-300 mb-2">
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
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                active
                  ? 'bg-orange-500/20 border border-orange-500 text-orange-300'
                  : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span>{item.emoji}</span>
              <span className="truncate">{item.label}</span>
              {active && <span className="ml-auto text-orange-400 flex-shrink-0">✓</span>}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-gray-500 mt-2">{selected.length} item(s) geselecteerd</p>
      )}
    </div>
  )
}
