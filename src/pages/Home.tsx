import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Reveal } from '../components/Reveal'
import { SectionHeader } from '../components/SectionHeader'
import { TrackCard } from '../components/TrackCard'
import { SharkCard } from '../components/SharkCard'
import { CountdownClock } from '../components/CountdownClock'
import { EVENT, FAQS, HOW_IT_WORKS, IDEAS, PRIZES, SHARKS, STATS, TIMELINE, TRACKS } from '../data'

export function Home() {
  const [activeFaq, setActiveFaq] = useState(0)

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="grid-lines" />
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="hero-copy">
          <p className="eyebrow"><i /> {EVENT.org.toUpperCase()} PRESENTS <span>—</span> 2025</p>
          <h1>Enter<br /><em>the Tank.</em></h1>
          <p className="hero-text">A 48-hour build sprint where bold teams turn raw ideas into ventures — then pitch them live to a panel of sharks.</p>
          <div className="hero-actions">
            <Link className="primary" to="/register">Enter the Tank <span>↗</span></Link>
            <a className="text-link" href="#concept">How it works <span>↓</span></a>
          </div>
        </div>
        <div className="hero-note">
          <span>01</span>
          <div>
            <b>PITCH THE SHARKS.<br />WIN THE DEAL.</b>
            <small>{EVENT.dates}<br />{EVENT.location}</small>
          </div>
        </div>
        <div className="scroll-cue">SCROLL TO EXPLORE <span>↓</span></div>
      </section>

      {/* TICKER */}
      <section className="ticker">
        <div>BUILD <span>✦</span> PITCH <span>✦</span> WIN THE DEAL <span>✦</span> BUILD <span>✦</span> PITCH <span>✦</span> WIN THE DEAL <span>✦</span></div>
      </section>

      {/* CONCEPT */}
      <section className="intro section" id="concept">
        <div className="intro-content">
          <Reveal><h2>Inspired by<br /><span>Shark Tank.</span></h2></Reveal>
          <Reveal delay={100}>
            <div>
              <p className="lead">Hack Tank turns the hackathon into a startup arena. Build for 48 hours, then step on stage and pitch your venture to real investors and mentors — the Sharks.</p>
              <p>Powered by {EVENT.org}, it is your shot to defend a bold idea, win the panel over, and walk away with funding, mentorship and momentum.</p>
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

      {/* TRACKS */}
      <section className="tracks section" id="tracks">
        <SectionHeader label="/ 02 — PICK YOUR ARENA" title="Six tracks." accent="One winning pitch." text="Choose the arena where your venture makes the biggest dent." />
        <div className="track-grid">
          {TRACKS.map((track, index) => (
            <Reveal key={track.id} delay={index * 60}><TrackCard track={track} index={index} /></Reveal>
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

      {/* SHARKS */}
      <section className="sharks section" id="sharks">
        <SectionHeader label="/ 03 — THE PANEL" title="Meet" accent="the Sharks." text="The investors and mentors who will challenge, question and back your venture." dark />
        <div className="shark-grid">
          {SHARKS.slice(0, 3).map((shark) => (
            <Reveal key={shark.name}><SharkCard shark={shark} /></Reveal>
          ))}
        </div>
        <div className="section-cta"><Link className="ghost-button" to="/sharks">See the full panel <span>↗</span></Link></div>
      </section>

      {/* PRIZES */}
      <section className="prizes section">
        <SectionHeader label="/ 04 — THE STAKES" title="Deals worth" accent="pitching for." />
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

      {/* TIMELINE */}
      <section className="timeline section">
        <SectionHeader label="/ 05 — THE RUN OF SHOW" title="From spark" accent="to stage." />
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

      {/* IDEA WALL */}
      <section className="ideas section" id="ideas">
        <SectionHeader label="/ 06 — THE IDEA WALL" title="Ventures already" accent="taking shape." text="Browse ideas from the community and find a crew to build with." />
        <div className="idea-grid">
          {IDEAS.slice(0, 3).map((idea) => (
            <Reveal key={idea.title} className="idea-card">
              <span className="idea-track">{idea.track}</span>
              <h3>{idea.title}</h3>
              <p>{idea.blurb}</p>
              <div className="idea-foot"><span>{idea.author}</span><b>Seeking: {idea.seeking}</b></div>
            </Reveal>
          ))}
        </div>
        <div className="section-cta"><Link className="ghost-button dark" to="/ideas">Explore the wall <span>↗</span></Link></div>
      </section>

      {/* FAQ */}
      <section className="faq section">
        <div className="section-label">/ GOOD TO KNOW</div>
        <div className="faq-layout">
          <h2>The questions<br /><span>you’re thinking.</span></h2>
          <div>
            {FAQS.slice(0, 4).map((faq, index) => (
              <div className="faq-row" key={faq.question}>
                <button onClick={() => setActiveFaq(activeFaq === index ? -1 : index)} aria-expanded={activeFaq === index}>
                  <span>{faq.question}</span>
                  <b>{activeFaq === index ? '−' : '+'}</b>
                </button>
                {activeFaq === index && <p>{faq.answer}</p>}
              </div>
            ))}
            <Link className="text-link dark" to="/faq">All questions <span>↗</span></Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta-band">
        <Reveal>
          <p className="section-label">/ YOUR MOVE</p>
          <h2>Ready to face<br /><span>the Sharks?</span></h2>
          <Link className="primary" to="/register">Enter the Tank <span>↗</span></Link>
        </Reveal>
      </section>
    </>
  )
}
