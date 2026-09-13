import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { TIMELINE } from '../data'

export function Timeline() {
  return (
    <div className="page">
      <section className="page-hero">
        <p className="section-label">/ THE RUN OF SHOW</p>
        <h1>From spark<br /><span>to stage.</span></h1>
        <p className="page-hero-text">Follow the journey from registration to the final pitch and discover what happens at every stage of the Tank.</p>
      </section>

      <section className="timeline section">
        <div className="section-heading">
          <div className="section-label">/ THE JOURNEY</div>
          <h2>Every step<br /><span>counts.</span></h2>
        </div>
        <div className="timeline-list">
          {TIMELINE.map((item, index) => (
            <Reveal key={item.title} delay={index * 50} className={`timeline-item ${index === 0 ? 'current' : ''}`}>
              <span className="timeline-number">{item.phase}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.date} — {item.detail}</p>
              </div>
              <span className="timeline-dot" />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <p className="section-label">/ YOUR MOVE</p>
        <h2>Ready to<br /><span>enter the Tank?</span></h2>
        <Link className="primary" to="/register">Register now <span>↗</span></Link>
      </section>
    </div>
  )
}