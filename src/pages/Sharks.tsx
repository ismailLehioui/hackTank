import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Reveal } from '../components/Reveal'
import { SharkCard } from '../components/SharkCard'
import { getPublicSharks } from '../services/registrations'
import type { Shark } from '../types'

export function Sharks() {
  const [sharks, setSharks] = useState<Shark[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    void getPublicSharks()
      .then((members) => {
        if (active) setSharks(members)
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Unable to load the jury panel.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  return (
    <div className="page page-dark">
      <section className="page-hero on-dark">
        <p className="section-label">/ THE PANEL</p>
        <h1>Meet<br /><span>the Sharks.</span></h1>
        <p className="page-hero-text">A panel of investors, founders and operators. They will question your assumptions, pressure-test your pitch — and back the ventures they believe in.</p>
      </section>

      <section className="section shark-grid full">
        {loading && <p className="sharks-feedback" role="status">Loading the jury panel...</p>}
        {!loading && loadError && <p className="sharks-feedback" role="alert">{loadError}</p>}
        {!loading && !loadError && sharks.length === 0 && <p className="sharks-feedback">Jury profiles will be announced soon.</p>}
        {!loading && !loadError && sharks.map((shark, index) => (
          <Reveal key={`${shark.name}-${index}`} delay={index * 60}><SharkCard shark={shark} /></Reveal>
        ))}
      </section>

      <section className="cta-band">
        <p className="section-label">/ YOUR MOVE</p>
        <h2>Think you can<br /><span>win them over?</span></h2>
        <Link className="primary" to="/register">Enter the Tank </Link>
      </section>
    </div>
  )
}
