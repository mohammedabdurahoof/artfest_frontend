import React, { useRef, useState, useEffect } from "react"

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Select..."
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div ref={ref} className="relative inline-block w-full">
      <div
        className="border rounded px-3 py-2 bg-white cursor-pointer min-h-[40px]"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm text-muted-foreground">
          {selected.length === 0
            ? placeholder
            : selected.join(" + ")}
        </span>
      </div>
      {open && (
        <div className="absolute z-10 bg-white border rounded shadow mt-1 w-full max-h-48 overflow-auto">
          {options.map(option => (
            <label
              key={option}
              className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => handleToggle(option)}
                className="mr-2"
              />
              <span className="text-sm">{option.charAt(0).toUpperCase() + option.slice(1)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default MultiSelect