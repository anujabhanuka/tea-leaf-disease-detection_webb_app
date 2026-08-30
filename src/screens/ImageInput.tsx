import { useState, type ChangeEvent } from 'react'
import { predictImage } from '../api'

type Screen = 'landing' | 'dashboard' | 'imageInput' | 'results'
type Navigate = (screen: Screen, payload?: unknown) => void

type Props = { navigate: Navigate; token: string }

export default function ImageInput({ navigate, token }: Props) {
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function getLocation(): Promise<{ latitude: number; longitude: number } | undefined> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined)
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => resolve(undefined),
        { enableHighAccuracy: true, timeout: 8000 },
      )
    })
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    setSelectedFile(f)
    setFileName(f.name)
    const reader = new FileReader()
    reader.onload = () => setFilePreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  async function analyze() {
    setError(null)
    if (!selectedFile) {
      setError('Please choose an image first.')
      return
    }

    setLoading(true)
    try {
      const data = await predictImage(selectedFile, token, await getLocation())

      const result = {
        diagnosis: data.disease ?? 'Unknown',
        confidence: data.confidence ?? 0,
        notes: data.message ?? ''
      }

      navigate('results', { image: filePreview, name: fileName, result })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', width: '100%', textAlign: 'center' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <p className="eyebrow">Diagnostic Tool</p>
        <h2 className="title">New Leaf Analysis</h2>
      </div>

      <div className="glass-panel p-6">
        {!filePreview ? (
          /* Modern Upload Area (Hidden File Input) */
          <label className="upload-area" style={{ display: 'block', margin: '0' }}>
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={onFile} 
            />
            
            {/* Upload Icon */}
            <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Click to select image
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Supports JPG, PNG (High resolution recommended)
            </p>
          </label>
        ) : (
          /* Modern Image Preview */
          <div>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <img 
                src={filePreview} 
                alt={fileName ?? 'preview'} 
                style={{ 
                  width: '100%', 
                  height: '320px', 
                  objectFit: 'cover', 
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  boxShadow: 'var(--shadow-glass)'
                }} 
              />
              <div style={{ 
                position: 'absolute', 
                bottom: '1rem', 
                left: '1rem', 
                background: 'rgba(15, 23, 42, 0.75)', 
                backdropFilter: 'blur(4px)',
                color: 'white', 
                padding: '0.4rem 0.8rem', 
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '500'
              }}>
                {fileName}
              </div>
            </div>

            {error && (
              <div style={{ 
                padding: '1rem', 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: '#ef4444', 
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px', 
                marginBottom: '1.5rem', 
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => {
                  setFilePreview(null)
                  setFileName(null)
                  setSelectedFile(null)
                  setError(null)
                }}
                disabled={loading}
              >
                Clear
              </button>
              
              <button 
                className="btn-primary" 
                style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }} 
                onClick={analyze} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="btn-icon" fill="none" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                      </path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  'Analyze Image'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}