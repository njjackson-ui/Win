import { useState, useRef, useEffect } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 font-semibold text-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          Home
          <svg className="w-4 h-4 ml-0.5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
            <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium">Home</button>
            <button className="w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 font-medium">Enstone</button>
          </div>
        )}
      </div>

      <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
        <svg className="w-7 h-7 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
        </svg>
      </button>
    </header>
  )
}
