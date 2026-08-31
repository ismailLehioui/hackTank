import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { IDEAS, TRACKS } from '../data'

export function Ideas() {
  const [filter, setFilter] = useState('All')

  const filters = useMemo(() => ['All', ...TRACKS.map((track) => track.name)], [])
  const visible = filter === 'All' ? IDEAS : IDEAS.filter((idea) => idea.track === filter)

  return (
    <div className="page">
      <section className="page-hero">
        <p className="section-label">/ IDEA WALL</p>
        <h1>Find your idea.<br /><span>Find your crew.</span></h1>
        <p className="page-hero-text">Browse ventures the community is already shaping. Join one, get inspired, or bring your own to the Tank.</p>
      </section>

      <section className="section">
        <div className="idea-filters">
          {filters.map((item) => (
            <button
              key={item}
              className={filter === item ? 'active' : ''}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="idea-grid full">
          {visible.map((idea) => (
            <Reveal key={idea.title} className="idea-card">
              <span className="idea-track">{idea.track}</span>
              <h3>{idea.title}</h3>
              <p>{idea.blurb}</p>
              <div className="idea-foot"><span>{idea.author}</span><b>Seeking: {idea.seeking}</b></div>
            </Reveal>
          ))}
        </div>
        {visible.length === 0 && <p className="empty-state">No ventures in this track yet — be the first to bring one.</p>}
      </section>

      <section className="cta-band">
        <p className="section-label">/ YOUR MOVE</p>
        <h2>Got a venture<br /><span>in mind?</span></h2>
        <Link className="primary" to="/register">Enter the Tank <span>↗</span></Link>
      </section>
    </div>
  )
}
