import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { IDEAS } from '../data'
import { getPublicIdeas } from '../services/registrations'
import type { Idea } from '../types'

export function Ideas() {
  const [ideas, setIdeas] = useState<Idea[]>(IDEAS)

  useEffect(() => {
    let active = true
    void getPublicIdeas()
      .then((nextIdeas) => {
        if (active && nextIdeas.length) setIdeas(nextIdeas)
      })
      .catch(() => {
        // Keep the local wall visible if Supabase is unavailable.
      })
    return () => { active = false }
  }, [])

  const visible = ideas

  return (
    <div className="page">
      <section className="page-hero">
        <p className="section-label">/ IDEA WALL</p>
        <h1>Find your idea.<br /><span>Find your crew.</span></h1>
        <p className="page-hero-text">Browse ventures the community is already shaping. Join one, get inspired, or bring your own to the Tank.</p>
      </section>

      <section className="section">
        <div className="idea-grid full">
          {visible.map((idea) => (
            <Reveal key={idea.title} className="idea-card">
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
