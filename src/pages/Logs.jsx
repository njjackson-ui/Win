import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { getDevices, getDeviceLogs } from '../api/client'

const MOCK_DEVICES = [
  { id: 'ZenWiFi_Pro_XT12-56D0', name: 'ZenWiFi_Pro_XT12-56D0' },
  { id: 'ASUS-RT-AX88U-3C22', name: 'ASUS-RT-AX88U-3C22' },
]

function makeMockLogs(count = 80) {
  const hosts = [
    'api.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com',
    'analytics.google.com', 'ads.doubleclick.net', 'telemetry.windows.com',
    'www.github.com', 'raw.githubusercontent.com', 'registry.npmjs.org',
    's3.amazonaws.com', 'edge.microsoft.com', 'update.apple.com',
    'ocsp.digicert.com', 'crl.sectigo.com', 'connect.facebook.net',
    'static.cloudflareinsights.com', 'safebrowsing.googleapis.com',
    'clients.l.google.com', 'youtube.com', 'netflix.com',
  ]
  const protocols = ['DNS', 'DNS', 'DNS', 'HTTPS', 'HTTP']
  const statuses = ['allowed', 'allowed', 'allowed', 'blocked']
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => ({
    id: `log-${i}`,
    timestamp: new Date(now - i * 2_800 - Math.random() * 1_500).toISOString(),
    protocol: protocols[Math.floor(Math.random() * protocols.length)],
    hostname: hosts[Math.floor(Math.random() * hosts.length)],
    duration_ms: Math.round(Math.random() * 280 + 2),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    client_ip: `192.168.1.${Math.floor(Math.random() * 60) + 10}`,
    upstream: '1.1.1.1',
  }))
}

const MOCK_LOGS = makeMockLogs()

export default function Logs() {
  const [selectedDevice, setSelectedDevice] = useState(MOCK_DEVICES[0].id)
  const [deviceOpen, setDeviceOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const deviceRef = useRef(null)
  const filterRef = useRef(null)

  useEffect(() => {
    const h = e => {
      if (deviceRef.current && !deviceRef.current.contains(e.target)) setDeviceOpen(false)
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const devicesQuery = useQuery({
    queryKey: ['devices'],
    queryFn: getDevices,
    select: d => d.devices ?? d,
    placeholderData: MOCK_DEVICES,
    retry: false,
  })
  const devices = devicesQuery.isError ? MOCK_DEVICES : (devicesQuery.data ?? MOCK_DEVICES)

  const logsQuery = useQuery({
    queryKey: ['logs', selectedDevice, search],
    queryFn: () => getDeviceLogs(selectedDevice, { search }),
    select: d => d.logs ?? d,
    placeholderData: MOCK_LOGS,
    retry: false,
    refetchInterval: 30_000,
  })
  const allLogs = logsQuery.isError ? MOCK_LOGS : (logsQuery.data ?? MOCK_LOGS)

  const logs = allLogs.filter(log => {
    if (statusFilter !== 'all' && log.status !== statusFilter) return false
    if (search && !log.hostname.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleRefresh = useCallback(() => { logsQuery.refetch() }, [logsQuery])

  const maxDuration = Math.max(...logs.map(l => l.duration_ms), 1)
  const selectedName = devices.find(d => d.id === selectedDevice)?.name ?? selectedDevice

  const allowedCount = logs.filter(l => l.status === 'allowed').length
  const blockedCount = logs.filter(l => l.status === 'blocked').length

  return (
    <div className="space-y-5">
      {/* Device selector */}
      <div className="relative inline-block" ref={deviceRef}>
        <button
          onClick={() => setDeviceOpen(o => !o)}
          className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl text-gray-800 font-medium text-base sm:text-lg min-w-[200px] hover:bg-gray-200 transition-colors"
        >
          <span className="flex-1 text-left">{selectedName}</span>
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
        {deviceOpen && (
          <div className="absolute top-full left-0 mt-1 w-full min-w-[220px] bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
            {devices.map(d => (
              <button
                key={d.id}
                onClick={() => { setSelectedDevice(d.id); setDeviceOpen(false) }}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                  d.id === selectedDevice ? 'text-blue-500 font-semibold bg-blue-50' : 'text-gray-700'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main panel */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        {/* Search + controls */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-3.5 py-2.5 border border-gray-100 focus-within:border-blue-300 focus-within:bg-white transition-colors">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search hostname..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-gray-700 outline-none text-base placeholder-gray-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(o => !o)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  filterOpen || statusFilter !== 'all'
                    ? 'border-blue-400 bg-blue-50 text-blue-500'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-2.5 w-36">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2 px-1">Status</p>
                  {['all', 'allowed', 'blocked'].map(s => (
                    <button
                      key={s}
                      onClick={() => { setStatusFilter(s); setFilterOpen(false) }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                        statusFilter === s ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={logsQuery.isFetching}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-300 bg-white transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-5 h-5 ${logsQuery.isFetching ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 mt-3">
            <span className="text-sm text-gray-400">{logs.length} entries</span>
            <span className="inline-flex items-center gap-1 text-sm text-green-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {allowedCount} allowed
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-red-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              {blockedCount} blocked
            </span>
            {logsQuery.isFetching && (
              <span className="ml-auto text-xs text-blue-400">Refreshing…</span>
            )}
            {logsQuery.isError && (
              <span className="ml-auto text-xs text-amber-500">Showing demo data — configure VITE_API_BASE_URL</span>
            )}
          </div>
        </div>

        {/* Log list */}
        <div className="divide-y divide-gray-50 max-h-[62vh] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No log entries match your filters</div>
          ) : (
            logs.map(log => <LogRow key={log.id} log={log} maxDuration={maxDuration} />)
          )}
        </div>
      </div>
    </div>
  )
}

function LogRow({ log, maxDuration }) {
  const [expanded, setExpanded] = useState(false)
  const pct = Math.max((log.duration_ms / maxDuration) * 100, 2)

  const barColor =
    log.duration_ms < 50 ? 'bg-green-400'
    : log.duration_ms < 150 ? 'bg-yellow-400'
    : 'bg-red-400'

  const statusStyle =
    log.status === 'allowed'
      ? 'text-green-700 bg-green-50'
      : 'text-red-600 bg-red-50'

  const protoStyle =
    log.protocol === 'DNS' ? 'text-blue-600 bg-blue-50'
    : log.protocol === 'HTTPS' ? 'text-purple-600 bg-purple-50'
    : 'text-orange-600 bg-orange-50'

  return (
    <div
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-center gap-2.5 px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md flex-shrink-0 w-14 text-center ${protoStyle}`}>
          {log.protocol}
        </span>

        <span className="flex-1 text-sm text-gray-800 truncate font-mono min-w-0">
          {log.hostname}
        </span>

        <div className="hidden sm:flex items-center gap-2 flex-shrink-0 w-32">
          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-gray-400 w-14 text-right">{log.duration_ms}ms</span>
        </div>

        <span className={`text-xs font-medium px-2 py-0.5 rounded-md flex-shrink-0 w-16 text-center ${statusStyle}`}>
          {log.status}
        </span>

        <span className="text-xs text-gray-400 flex-shrink-0 w-14 text-right tabular-nums">
          {format(parseISO(log.timestamp), 'HH:mm:ss')}
        </span>
      </div>

      {expanded && (
        <div className="px-4 pb-3 bg-gray-50 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-2 text-xs">
            <Detail label="Timestamp" value={format(parseISO(log.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')} mono />
            <Detail label="Client IP" value={log.client_ip} mono />
            <Detail label="Protocol" value={log.protocol} />
            <Detail label="Duration" value={`${log.duration_ms}ms`} />
            <Detail label="Status" value={log.status} />
            {log.upstream && <Detail label="Upstream" value={log.upstream} mono />}
          </div>
        </div>
      )}
    </div>
  )
}

function Detail({ label, value, mono }) {
  return (
    <div className="flex gap-1.5">
      <span className="text-gray-400 flex-shrink-0">{label}:</span>
      <span className={`text-gray-700 truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
