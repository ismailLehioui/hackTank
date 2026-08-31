import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { PRIZES, TRACKS } from '../data'

export function Tracks() {
  return (
    <div className="page">
      <section className="page-hero">
        <p className="section-label">/ TRACKS & PRIZES</p>
        <h1>Pick your arena.<br /><span>Pitch to win.</span></h1>
        <p className="page-hero-text">Every track is an open challenge. Choose the one where your venture can make the biggest dent, then build to impress the Sharks.</p>
      </section>

      <section className="section track-detail-grid">
        {TRACKS.map((track, index) => (
          <Reveal key={track.id} delay={index * 60} className="track-detail" >
            <div className="track-detail-inner" style={{ '--track-color': track.color } as CSSProperties}>
              <span className="track-icon">{track.icon}</span>
              <div className="track-detail-index">0{index + 1}</div>
              <h3>{track.name}</h3>
              <p>{track.pitch}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="section prizes-page">
        <div className="section-heading">
          <div className="section-label">/ THE STAKES</div>
          <h2>Deals worth<br /><span>pitching for.</span></h2>
        </div>
        <div className="prize-grid">
          {PRIZES.map((prize) => (
            <Reveal key={prize.rank} className={`prize ${prize.className}`}>
              <span>{prize.rank}</span>
              <strong>{prize.amount} <small>{prize.unit}</small></strong>
              <p className="prize-tier">{prize.tier}</p>
              <ul>{prize.perks.map((perk) => <li key={perk}>{perk}</li>)}</ul>
              <b>{prize.glyph}</b>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <p className="section-label">/ YOUR MOVE</p>
        <h2>Found your<br /><span>arena?</span></h2>
        <Link className="primary" to="/register">Enter the Tank <span>↗</span></Link>
      </section>
    </div>
  )
}
