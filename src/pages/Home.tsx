import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Reveal } from '../components/Reveal'
import { SectionHeader } from '../components/SectionHeader'
import { SharkCard } from '../components/SharkCard'
import { CountdownClock } from '../components/CountdownClock'
import { EVENT, HOW_IT_WORKS, IDEAS, SHARKS, STATS } from '../data'
import { getPublicIdeas, getPublicSharks, getSiteSettings } from '../services/registrations'
import type { Shark } from '../types'

export function Home() {
  const [sharks, setSharks] = useState<Shark[]>(SHARKS)
  const [ideas, setIdeas] = useState(IDEAS)
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void getSiteSettings()
      .then((settings) => {
        if (active) setHeroImageUrl(settings.hero_image_url)
      })
      .catch(() => {
        // The bundled hero remains available if settings cannot be fetched.
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    void getPublicSharks()
      .then((members) => {
        if (active && members.length) setSharks(members)
      })
      .catch(() => {
        // Keep the local panel visible if Supabase is unavailable.
      })
    return () => { active = false }
  }, [])

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

  return (
    <>
      {/* HERO */}
      <section className="hero" style={{ '--hero-image': heroImageUrl ? `url("${heroImageUrl}")` : undefined } as CSSProperties}>
        <div className="grid-lines" />
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="hero-copy">
          <p className="eyebrow"><i /> {EVENT.org.toUpperCase()} PRESENTS <span>—</span> 2026</p>
          <div className="hero-heading-space" aria-hidden="true" />
          <p className="hero-text">A 24-hour build sprint where bold teams turn raw ideas into ventures — then pitch them live to a panel of sharks.</p>
          <div className="hero-actions">
            <Link className="primary" to="/register">Enter the Tank 
            {/* <span>↗</span> */}
            </Link>
            <a className="text-link" href="#concept">How it works <span>↓</span></a>
          </div>
        </div>
        <div className="hero-note">
          {/* <span>01</span> */}
          <div>
            {EVENT.dates}<br />
            <b>{EVENT.location}<br />L'Orient Palace Hotel</b>
            {/* <small>{EVENT.dates}<br /></small> */}
            
          </div>
        </div>
        <div className="scroll-cue">SCROLL TO EXPLORE <span>↓</span></div>
      </section>

      {/* CONCEPT */}
      <section className="intro section" id="concept">
        <div className="intro-content">
          <Reveal><h2>Inspired by<br /><span>Shark Tank.</span></h2></Reveal>
          <Reveal delay={100}>
            <div>
              {/* <p className="lead">Hack Tank turns the hackathon into a startup arena. Build for 24 hours, then step on stage and pitch your venture to real investors and mentors — the Sharks.</p> */}
              <p className="lead">The best pitches lesve with cash prizes, exposure, and momentum.</p>
              <p>Powered by {EVENT.org}, it is your shot to defend a bold idea, win the panel over, and walk away with cash prizes, exposure, and momentum.</p>
              <Link className="circle-link" to="/register">Step into the Tank <span>↗</span></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* STATS */}
      <section className="stats section">
        {STATS.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 80} className="stat">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </Reveal>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section className="how section">
        <SectionHeader label="/ 01 — THE FORMAT" title="From idea" accent="to the deal." text="Four moves take you from sign-up to standing in front of the Sharks." />
        <div className="how-grid">
          {HOW_IT_WORKS.map((item, index) => (
            <Reveal key={item.step} delay={index * 90} className="how-card">
              <span className="how-step">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* COUNTDOWN */}
      <section className="countdown section">
        <div>
          <div className="section-label">/ THE COUNTDOWN</div>
          <h2>The Tank<br /><span>opens in.</span></h2>
        </div>
        <CountdownClock />
      </section>

      {/* FINAL CTA */}
      <section className="cta-band">
        <Reveal>
          <p className="section-label">/ YOUR MOVE</p>
          <h2>Ready to face<br /><span>the Sharks?</span></h2>
          <Link className="primary" to="/register">Enter the Tank </Link>
        </Reveal>
      </section>
    </>
  )
}
