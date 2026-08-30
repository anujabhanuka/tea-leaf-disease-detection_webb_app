type Screen = 'landing' | 'dashboard' | 'imageInput' | 'results'
type Navigate = (screen: Screen, payload?: unknown) => void

type Props = { navigate: Navigate }

export default function Landing({ navigate }: Props) {
  return (
    <div className="screen landing">
      <section className="hero-block">
        <div className="hero-copy">
          <p className="landing-kicker">Field intelligence for every leaf</p>
          <h1>See what your tea leaves are telling you.</h1>
          <p className="hero-description">
            Turn a single leaf image into a clear, actionable health check for your crop.
          </p>

          <div className="actions">
            <button onClick={() => navigate('imageInput')} className="btn primary">
              Analyze an image <span aria-hidden="true">↗</span>
            </button>
            <button onClick={() => navigate('dashboard')} className="btn secondary">
              Open dashboard
            </button>
          </div>

          <div className="hero-proof" aria-label="TeaLeaf product benefits">
            <span><strong>01</strong> Upload a leaf</span>
            <span><strong>02</strong> Get a diagnosis</span>
            <span><strong>03</strong> Act with confidence</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="visual-label">Live crop check <span>●</span></div>
          <div className="leaf-orbit orbit-one" />
          <div className="leaf-orbit orbit-two" />
          <div className="leaf-art">
            <div className="leaf-stem" />
            <div className="leaf-shape" />
            <div className="leaf-vein vein-one" />
            <div className="leaf-vein vein-two" />
            <div className="leaf-vein vein-three" />
          </div>
          <div className="visual-caption">
            <span className="caption-dot" />
            <div><strong>Healthy growth</strong><small>Ready for analysis</small></div>
          </div>
        </div>
      </section>

      <aside className="landing-stats">
        <div><strong>Fast</strong><span>Image-based screening</span></div>
        <div><strong>Clear</strong><span>Practical next steps</span></div>
        <div><strong>Focused</strong><span>Built for tea growers</span></div>
      </aside>
    </div>
  )
}
