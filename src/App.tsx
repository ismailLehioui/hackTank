import { useEffect, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'

type Track = { icon: string; name: string; text: string; color: string }

const tracks: Track[] = [
  { icon: '◈', name: 'AI & Humans', text: 'Build intelligence that makes everyday life more human.', color: '#4b8dff' },
  { icon: '↗', name: 'Fintech', text: 'Reimagine how communities access and move money.', color: '#f4b400' },
  { icon: '✦', name: 'Sustainability', text: 'Turn climate pressure into measurable progress.', color: '#46c985' },
  { icon: '⌁', name: 'Smart Cities', text: 'Design the systems that make cities feel alive.', color: '#ed7759' },
  { icon: '◎', name: 'Education', text: 'Unlock better ways to learn, teach and share.', color: '#a278ff' },
  { icon: '＋', name: 'Open Innovation', text: 'No box. No brief. Just your most ambitious idea.', color: '#57c9dd' },
]

const timeline = ['Registration open', 'Team formation', 'Mentoring phase', 'Hackathon day', 'Jury evaluation', 'Awards ceremony']

function App() {
  const [page, setPage] = useState<'home' | 'register'>('home')
  const [activeFaq, setActiveFaq] = useState(0)
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [time, setTime] = useState({ days: 18, hours: 7, minutes: 42, seconds: 9 })

  useEffect(() => {
    const timer = window.setInterval(() => setTime((current) => {
      let { days, hours, minutes, seconds } = current
      if (seconds > 0) seconds -= 1
      else { seconds = 59; if (minutes > 0) minutes -= 1; else { minutes = 59; if (hours > 0) hours -= 1; else { hours = 23; days = Math.max(0, days - 1) } } }
      return { days, hours, minutes, seconds }
    }), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const goHome = () => { setPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const nextStep = (event: FormEvent) => { event.preventDefault(); if (step < 5) setStep(step + 1); else setSubmitted(true) }

  if (page === 'register') return <Registration step={step} setStep={setStep} submitted={submitted} onSubmit={nextStep} onBack={goHome} />

  return <div className="app-shell">
    <header className="nav"><button className="brand" onClick={goHome}><span className="brand-mark">HT</span><span>HACK <b>TANK</b></span></button><nav><a href="#experience">Experience</a><a href="#tracks">Tracks</a><a href="#impact">Impact</a></nav><button className="nav-cta" onClick={() => setPage('register')}>Join the tank <span>↗</span></button></header>

    <main>
      <section className="hero" id="experience"><div className="grid-lines" /><div className="orb orb-one" /><div className="orb orb-two" />
        <div className="hero-copy"><p className="eyebrow"><i /> JCI SOUSSE PRESENTS <span>—</span> 2025</p><h1>Make the<br /><em>unthinkable</em><br />useful.</h1><p className="hero-text">A 48-hour collision of sharp minds, wild ideas and the courage to build what comes next.</p><div className="hero-actions"><button className="primary" onClick={() => setPage('register')}>Register your team <span>↗</span></button><a className="text-link" href="#about">Explore the experience <span>↓</span></a></div></div>
        <div className="hero-note"><span>01</span><div><b>WHERE IDEAS<br />BECOME STARTUPS</b><small>June 14 — 16, 2025<br />Sousse, Tunisia</small></div></div>
        <div className="scroll-cue">SCROLL TO EXPLORE <span>↓</span></div>
      </section>

      <section className="ticker"><div>BUILD <span>✦</span> BREAK BOUNDARIES <span>✦</span> CREATE IMPACT <span>✦</span> BUILD <span>✦</span> BREAK BOUNDARIES <span>✦</span></div></section>

      <section className="intro section" id="about"><div className="section-label">/ 01 — THE WHY</div><div className="intro-content"><h2>Not another<br /><span>hackathon.</span></h2><div><p className="lead">Hack Tank is a pressure cooker for ideas with a pulse. We bring together makers, dreamers and doers to turn meaningful problems into things people can actually use.</p><p>Powered by JCI Sousse, this is your invitation to step out of the usual, find your people and put a dent in the universe — one scrappy prototype at a time.</p><button className="circle-link" onClick={() => setPage('register')}>Start your story <span>↗</span></button></div></div></section>

      <section className="stats section"><div className="stat"><strong>48</strong><span>HOURS TO<br />BUILD</span></div><div className="stat"><strong>06</strong><span>IMPACT<br />TRACKS</span></div><div className="stat"><strong>50K</strong><span>TND IN<br />PRIZES</span></div><div className="stat"><strong>∞</strong><span>WAYS TO<br />MAKE IMPACT</span></div></section>

      <section className="tracks section" id="tracks"><div className="section-heading"><div className="section-label">/ 02 — PICK YOUR FIGHT</div><h2>Find your<br /><span>unfair advantage.</span></h2><p>Six open-ended arenas. One chance to make a dent in the world.</p></div><div className="track-grid">{tracks.map((track, index) => <article className="track-card" key={track.name} style={{ '--track-color': track.color } as CSSProperties}><div className="track-top"><span className="track-icon">{track.icon}</span><span>0{index + 1}</span></div><h3>{track.name}</h3><p>{track.text}</p><span className="card-arrow">↗</span></article>)}</div></section>

      <section className="countdown section"><div><div className="section-label">/ THE COUNTDOWN</div><h2>Ready when<br /><span>you are.</span></h2></div><div className="clock">{Object.entries(time).map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, '0')}</strong><span>{label}</span></div>)}</div></section>

      <section className="timeline section"><div className="section-heading"><div className="section-label">/ 03 — THE RUN OF SHOW</div><h2>From spark<br /><span>to story.</span></h2></div><div className="timeline-list">{timeline.map((item, index) => <div className={'timeline-item ' + (index === 0 ? 'current' : '')} key={item}><span className="timeline-number">0{index + 1}</span><div><h3>{item}</h3><p>{['May 01 — June 10, 2025', 'June 11 — 13, 2025', 'June 14, 2025 · Online', 'June 15 — 16, 2025 · Sousse', 'June 16, 2025 · 17:00', 'June 16, 2025 · 19:00'][index]}</p></div><span className="timeline-dot" /></div>)}</div></section>

      <section className="impact section" id="impact"><div className="impact-panel"><div className="section-label">/ THE COLLECTIVE</div><h2>Good ideas<br />need <span>good company.</span></h2><p>Meet the collaborators, mentors and challengers who will push your idea further than you thought possible.</p><div className="avatars"><span>AM</span><span>YA</span><span>SK</span><span>+42</span></div><button className="dark-button" onClick={() => setPage('register')}>Find your future teammates <span>↗</span></button></div><div className="network"><div className="network-line line-a" /><div className="network-line line-b" /><div className="network-node node-a">AI</div><div className="network-node node-b">✦</div><div className="network-node node-c">UX</div><div className="network-node node-d">PM</div><div className="network-center">HT</div></div></section>

      <section className="prizes section"><div className="section-heading"><div className="section-label">/ MAKE IT COUNT</div><h2>The kind of<br /><span>win that lasts.</span></h2></div><div className="prize-grid"><div className="prize prize-gold"><span>01 / GOLD</span><strong>25K <small>TND</small></strong><p>For the idea with the biggest possible impact.</p><b>✦</b></div><div className="prize prize-silver"><span>02 / SILVER</span><strong>15K <small>TND</small></strong><p>For the team that makes impossible look easy.</p><b>✧</b></div><div className="prize prize-bronze"><span>03 / BRONZE</span><strong>10K <small>TND</small></strong><p>For the concept we cannot stop thinking about.</p><b>◌</b></div></div></section>

      <section className="faq section"><div className="section-label">/ GOOD TO KNOW</div><div className="faq-layout"><h2>The questions<br /><span>you’re thinking.</span></h2><div>{['Who can participate?', 'Do I need a team to register?', 'What should I bring?', 'What happens after the hackathon?'].map((question, index) => <div className="faq-row" key={question}><button onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}><span>{question}</span><b>{activeFaq === index ? '−' : '+'}</b></button>{activeFaq === index && <p>Hack Tank is open to curious people of every background. You do not need a finished idea or a team — just the energy to make something meaningful.</p>}</div>)}</div></div></section>
    </main>
    <footer><div className="brand"><span className="brand-mark">HT</span><span>HACK <b>TANK</b></span></div><p>Made for the bold.<br />Powered by JCI Sousse.</p><span>© 2025 JCI SOUSSE</span></footer>
  </div>
}

function Registration({ step, setStep, submitted, onSubmit, onBack }: { step: number; setStep: (step: number) => void; submitted: boolean; onSubmit: (event: FormEvent) => void; onBack: () => void }) {
  if (submitted) return <div className="register-page success-page"><button className="brand" onClick={onBack}><span className="brand-mark">HT</span><span>HACK <b>TANK</b></span></button><div className="success-content"><div className="success-mark">✦</div><div className="section-label">/ YOU’RE IN THE ROOM</div><h1>Now make it<br /><em>matter.</em></h1><p>Your application is on its way. We’ll be in touch soon with everything you need to make your 48 hours count.</p><button className="primary" onClick={onBack}>Back to Hack Tank <span>↗</span></button></div></div>
  const labels = ['Participant', 'Background', 'Skills', 'Project', 'Review']
  return <div className="register-page"><header className="nav register-nav"><button className="brand" onClick={onBack}><span className="brand-mark">HT</span><span>HACK <b>TANK</b></span></button><span className="form-count">APPLICATION / 2025</span><button className="close-button" onClick={onBack}>×</button></header><div className="form-wrap"><aside><div className="section-label">/ YOUR APPLICATION</div><h1>Bring the<br /><em>spark.</em></h1><p>Tell us a little about yourself, then let’s make something impossible feel inevitable.</p><div className="steps">{labels.map((label, index) => <button key={label} className={step === index + 1 ? 'active' : step > index + 1 ? 'done' : ''} onClick={() => setStep(index + 1)}><span>0{index + 1}</span>{label}<b>{step > index + 1 ? '✓' : ''}</b></button>)}</div></aside><form onSubmit={onSubmit}><div className="form-kicker">STEP 0{step} / 05</div>{step === 1 && <><h2>Let’s start with<br /><span>you.</span></h2><div className="input-grid"><label>First name<input required placeholder="e.g. Amina" /></label><label>Last name<input required placeholder="e.g. Ben Ali" /></label><label>Email address<input required type="email" placeholder="you@email.com" /></label><label>Phone number<input required placeholder="+216" /></label><label>Age<input required type="number" placeholder="24" /></label><label>City<input required placeholder="Sousse" /></label></div></>}{step === 2 && <><h2>Your world of<br /><span>work.</span></h2><div className="input-grid"><label>University<input placeholder="Where you learned" /></label><label>Company<input placeholder="Where you build" /></label><label>Position<input placeholder="Your role" /></label><label>Experience level<select defaultValue=""><option value="" disabled>Choose one</option><option>Student</option><option>Early career</option><option>Experienced</option></select></label></div></>}{step === 3 && <><h2>What do you<br /><span>bring?</span></h2><p className="form-hint">Pick all the skills you’d love to put to work.</p><div className="skill-grid">{['Frontend', 'Backend', 'DevOps', 'Mobile', 'UI/UX', 'Data Science', 'AI', 'Product Management', 'Marketing', 'Business'].map(skill => <label key={skill}><input type="checkbox" /> <span>{skill}</span></label>)}</div></>}{step === 4 && <><h2>Give it a<br /><span>name.</span></h2><div className="input-grid single"><label>Team name<input required placeholder="Something people remember" /></label><label>Project idea<textarea required placeholder="What are you building?" /></label><label>Problem statement<textarea required placeholder="Who has this problem, and why does it matter?" /></label></div></>}{step === 5 && <><h2>One last<br /><span>look.</span></h2><div className="review"><p><b>Participant</b><span>New application</span></p><p><b>Experience</b><span>Ready to make an impact</span></p><p><b>Skills</b><span>Your selected toolkit</span></p><p><b>Project</b><span>Your idea, ready to grow</span></p></div></>}<div className="form-actions">{step > 1 && <button type="button" className="back-button" onClick={() => setStep(step - 1)}>← Back</button>}<button className="primary" type="submit">{step === 5 ? 'Submit application' : 'Continue'} <span>↗</span></button></div></form></div></div>
}

export default App
