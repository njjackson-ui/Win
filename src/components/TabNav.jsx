export default function TabNav({ tabs, active, onChange }) {
  return (
    <nav className="flex items-center gap-2 sm:gap-6 px-4 sm:px-6 py-3 border-b border-gray-200 overflow-x-auto no-scrollbar">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 sm:px-6 py-2 rounded-xl font-medium text-base sm:text-lg whitespace-nowrap transition-all ${
            active === tab
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-blue-500 hover:text-blue-700'
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  )
}
