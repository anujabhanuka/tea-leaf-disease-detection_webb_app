import { useEffect, useState, type ComponentType } from 'react'
import { fetchAllHistory, type HistoryRecord } from '../api'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'

const LeafletMapContainer = MapContainer as unknown as ComponentType<Record<string, unknown>>
const LeafletTileLayer = TileLayer as unknown as ComponentType<Record<string, unknown>>
const LeafletCircleMarker = CircleMarker as unknown as ComponentType<Record<string, unknown>>
const LeafletTooltip = Tooltip as unknown as ComponentType<Record<string, unknown>>

type Screen = 'landing' | 'dashboard' | 'imageInput' | 'results'
type Navigate = (screen: Screen, payload?: unknown) => void

type Props = { navigate: Navigate; token: string }

type MapPoint = {
  id: number;
  name: string;
  username?: string;
  severity: string;
  lat: number;
  lng: number;
  date: string;
}

export default function Dashboard({ navigate, token }: Props) {
  const [stats, setStats] = useState([
    { label: 'Total Reports', value: '0', delta: 'Fetching...', tone: 'emerald', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
    { label: 'Affected Plants', value: '0', delta: 'Fetching...', tone: 'amber', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> },
  //  { label: 'Health Rate', value: '0%', delta: 'Fetching...', tone: 'blue', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /> },
    { label: 'Critical Alerts', value: '0', delta: 'Fetching...', tone: 'rose', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /> }
  ])

  const [diseaseStats, setDiseaseStats] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.9271, 79.8612]) // Default center (e.g., Colombo)

  useEffect(() => {
    fetchAllHistory(token)
      .then((data) => {
        const history = data.history || []
        const totalReports = history.length

        let affected = 0
        let critical = 0
        const diseaseCounts: Record<string, number> = {}
        const validLocations: Array<HistoryRecord & { latitude: number; longitude: number }> = []

        history.forEach((record) => {
          const disease = record.disease
          const isHealthy = disease.toLowerCase() === 'healthy'
          diseaseCounts[disease] = (diseaseCounts[disease] || 0) + 1

          if (!isHealthy) {
            affected++
            if (record.confidence > 0.85) critical++
          }

          if (typeof record.latitude === 'number' && typeof record.longitude === 'number') {
            validLocations.push(record as HistoryRecord & { latitude: number; longitude: number })
          }
        })

        // Stats updates
        const healthRate = totalReports > 0 ? Math.round(((totalReports - affected) / totalReports) * 100) : 0
        setStats(prev => [
          { ...prev[0], value: totalReports.toString(), delta: '+ Live' },
          { ...prev[1], value: affected.toString(), delta: '+ Live' },
          //{ ...prev[2], value: `${healthRate}%`, delta: '+ Live' },
          { ...prev[2], value: critical.toString(), delta: '+ Live' }
        ])

        const baseColors: Record<string, string> = {
          'Leaf Rust': '#f97316',
          'Red Spider Mite': '#ef4444',
          'Brown Blight': '#facc15',
          'Healthy': '#10b981'
        }

        setDiseaseStats(Object.entries(diseaseCounts)
          .map(([name, count]) => ({
            name,
            value: Math.round(((count as number) / totalReports) * 100),
            color: baseColors[name] || '#8b5cf6'
          }))
          .sort((a, b) => b.value - a.value))

        // Map points processing for Leaflet
        if (validLocations.length > 0) {
          const dynamicPoints = validLocations.map(loc => {
            let severity = 'low' // Healthy
            if (loc.disease === 'Red Spider Mite') severity = 'critical'
            else if (loc.disease === 'Leaf Rust') severity = 'high'
            else if (loc.disease === 'Brown Blight') severity = 'medium'
            else if (loc.disease.toLowerCase() !== 'healthy') severity = 'medium'

            return {
              id: loc.id,
              name: loc.disease,
              username: loc.username,
              severity: severity,
              lat: loc.latitude,
              lng: loc.longitude,
              date: new Date(loc.timestamp).toLocaleDateString()
            }
          })
          setMapPoints(dynamicPoints)

          // Center map on the latest scan
          setMapCenter([
            dynamicPoints[dynamicPoints.length - 1].lat,
            dynamicPoints[dynamicPoints.length - 1].lng
          ])
        }
      })
      .catch((err) => console.error('Failed to load admin history', err))
  }, [token])

  // Pick color for Leaflet CircleMarker based on severity
  const getMarkerColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444' // Red
      case 'high': return '#f97316'     // Orange
      case 'medium': return '#facc15'   // Yellow
      default: return '#10b981'         // Green
    }
  }

  return (
    <div className="dashboard-root">
      <header className="dash-header">
        <div className="header-text">
          <p className="eyebrow">Plantation Management</p>
          <h2 className="title">Administrative Dashboard</h2>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">Export Report</button>
          <button className="btn-primary" onClick={() => navigate('imageInput')}>
            <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Scan
          </button>
        </div>
      </header>

      {/* KPI Grid */}
      <section className="kpi-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="kpi-card glass-panel">
            <div className={`icon-box ${stat.tone}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">{stat.icon}</svg>
            </div>
            <div className="kpi-content">
              <p className="kpi-label">{stat.label}</p>
              <div className="kpi-data">
                <h3 className="kpi-value">{stat.value}</h3>
                <span className={`kpi-badge ${stat.tone}`}>{stat.delta}</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Main Layout */}
      <div className="dash-layout">
        <div className="dash-column-left">
          
          <article className="glass-panel p-6">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Overview</p>
                <h3>Analytics & Statistics</h3>
              </div>
              <span className="live-badge"><span className="pulse-dot"></span> Live</span>
            </div>

            <div className="chart-container">
              {diseaseStats.map((disease) => (
                <div key={disease.name} className="chart-row">
                  <span className="chart-label">{disease.name}</span>
                  <div className="progress-bg">
                    <div className="progress-fill" style={{ width: `${disease.value}%`, backgroundColor: disease.color }} />
                  </div>
                  <span className="chart-percent">{disease.value}%</span>
                </div>
              ))}
              {diseaseStats.length === 0 && (
                <div className="empty-state" style={{ color: 'var(--text-muted)' }}>No predictions recorded yet.</div>
              )}
            </div>
          </article>

          {/* LEAFLET MAP PANEL */}
          <article className="glass-panel p-0 overflow-hidden">
            <div className="panel-header p-6 pb-4">
              <div>
                <p className="eyebrow">Geographic Insights</p>
                <h3>Disease Distribution (Leaflet GPS)</h3>
              </div>
              <div className="legend">
                <span className="legend-item"><span className="dot critical"></span> Critical</span>
                <span className="legend-item"><span className="dot high"></span> High</span>
                <span className="legend-item"><span className="dot medium"></span> Medium</span>
                <span className="legend-item"><span className="dot healthy"></span> Healthy</span>
              </div>
            </div>
            
            <div style={{ height: '350px', width: '100%', position: 'relative' }}>
              <LeafletMapContainer 
                center={mapCenter} 
                zoom={14} 
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                {/* Clean OpenStreetMap Tile Layer */}
                <LeafletTileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {mapPoints.map((point) => (
                  <LeafletCircleMarker
                    key={point.id}
                    center={[point.lat, point.lng]}
                    radius={8}
                    pathOptions={{
                      color: '#ffffff',
                      weight: 2,
                      fillColor: getMarkerColor(point.severity),
                      fillOpacity: 0.9
                    }}
                  >
                    <LeafletTooltip permanent direction="top" offset={[0, -8]}>{point.name}</LeafletTooltip>
                    <Popup>
                      <div style={{ color: '#1e293b', textAlign: 'center' }}>
                        <strong style={{ fontSize: '0.95rem' }}>{point.name}</strong><br/>
                        {point.username && <span style={{ fontSize: '0.75rem' }}>User: {point.username}<br/></span>}
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Scanned: {point.date}</span>
                      </div>
                    </Popup>
                  </LeafletCircleMarker>
                ))}
              </LeafletMapContainer>
            </div>
          </article>

        </div>

        {/* Right Column: Operations Panel */}
        <div className="dash-column-right">
          <article className="glass-panel p-6 h-full">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Operations</p>
                <h3>Field Priorities</h3>
              </div>
            </div>
            <ul className="priority-list">
              <li className="priority-item">
                <div className="priority-dot critical"></div>
                <div className="priority-text">
                  <strong>Inspect East Block</strong>
                  <span>High confidence rust detected.</span>
                </div>
              </li>
              <li className="priority-item">
                <div className="priority-dot high"></div>
                <div className="priority-text">
                  <strong>Spray Schedule Due</strong>
                  <span>North Estate requires attention.</span>
                </div>
              </li>
              <li className="priority-item">
                <div className="priority-dot healthy"></div>
                <div className="priority-text">
                  <strong>South Valley Recovery</strong>
                  <span>Health metrics trending upward.</span>
                </div>
              </li>
            </ul>
          </article>
        </div>
      </div>
    </div>
  )
}