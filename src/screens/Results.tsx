type Screen = 'landing' | 'dashboard' | 'imageInput' | 'results'
type Navigate = (screen: Screen, payload?: unknown) => void

type ResultPayload = {
  image?: string | null
  name?: string | null
  result?: {
    diagnosis?: string
    confidence?: number
    notes?: string
  }
}

type Props = {
  payload: unknown
  navigate: Navigate
}

export default function Results({ payload, navigate }: Props) {
  const { image, name, result } = (payload as ResultPayload | null) ?? {}

  return (
    <div className="screen results">
      <h2>Analysis Results</h2>

      {image ? (
        <div className="result-body">
          <img src={image} alt={name ?? 'leaf'} className="result-image" />
          <div className="result-meta">
            <h3>{result?.diagnosis ?? 'Unknown'}</h3>
            <p>Confidence: {Math.round((result?.confidence ?? 0) * 100)}%</p>
            <p>{result?.notes}</p>
            <div className="result-actions">
              <button className="btn" onClick={() => navigate('dashboard')}>
                Back to Dashboard
              </button>
              <button className="btn primary" onClick={() => navigate('imageInput')}>
                Analyze another
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p>No image provided.</p>
      )}
    </div>
  )
}
