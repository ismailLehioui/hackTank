import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Brand } from '../components/Brand'
import { EXPERIENCE_LEVELS, SKILLS, TRACKS } from '../data'
import type { RegistrationData } from '../types'
import { isSupabaseConfigured, submitRegistration } from '../services/registrations'

const STEP_LABELS = ['Participant', 'Background', 'Skills', 'Venture', 'Review']
const STORAGE_KEY = 'hacktank-registration'

const emptyData: RegistrationData = {
  firstName: '', lastName: '', email: '', phone: '', age: '', city: '', country: '',
  university: '', company: '', position: '', experience: '',
  skills: [], hasTeam: '',
  teamName: '', track: '', idea: '', problem: '',
  lookingForTeammates: false, acceptRules: false,
}

function loadDraft(): RegistrationData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY + '-draft')
    if (raw) return { ...emptyData, ...JSON.parse(raw) }
  } catch {
    // ignore corrupted drafts
  }
  return emptyData
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Register() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [data, setData] = useState<RegistrationData>(loadDraft)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = <K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => {
    setData((prev) => {
      const next = { ...prev, [key]: value }
      try { localStorage.setItem(STORAGE_KEY + '-draft', JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const toggleSkill = (skill: string) => {
    update('skills', data.skills.includes(skill) ? data.skills.filter((s) => s !== skill) : [...data.skills, skill])
  }

  const validateStep = (): boolean => {
    const next: Record<string, string> = {}
    if (step === 1) {
      if (!data.firstName.trim()) next.firstName = 'Required'
      if (!data.lastName.trim()) next.lastName = 'Required'
      if (!emailPattern.test(data.email)) next.email = 'Enter a valid email'
      if (!data.phone.trim()) next.phone = 'Required'
      if (!data.age || Number(data.age) < 15 || Number(data.age) > 99) next.age = 'Enter a valid age'
      if (!data.city.trim()) next.city = 'Required'
      if (!data.country.trim()) next.country = 'Required'
    }
    if (step === 2) {
      if (!data.experience) next.experience = 'Choose your level'
    }
    if (step === 3) {
      if (data.skills.length === 0) next.skills = 'Pick at least one skill'
      if (!data.hasTeam) next.hasTeam = 'Let us know'
    }
    if (step === 4) {
      if (!data.idea.trim()) next.idea = 'Tell us your idea'
      if (!data.problem.trim()) next.problem = 'Describe the problem'
    }
    if (step === 5) {
      if (!data.acceptRules) next.acceptRules = 'Please accept to continue'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const goNext = async () => {
    if (!validateStep()) return
    if (step < 5) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      await handleSubmit()
    }
  }

  const handleSubmit = async () => {
    if (!isSupabaseConfigured) {
      setSubmitError('Registration is not configured yet. Please contact the organizers.')
      return
    }
    setIsSubmitting(true)
    setSubmitError('')
    try {
      await submitRegistration(data)
      localStorage.removeItem(STORAGE_KEY + '-draft')
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit your application. Please try again.'
      setSubmitError(message.includes('duplicate') ? 'This email is already registered.' : message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="register-page success-page">
        <div className="register-nav-mini"><Brand /></div>
        <div className="success-content">
          <div className="success-mark"><Check size={34} /></div>
          <div className="section-label">/ YOU’RE IN THE TANK</div>
          <h1>Now go build<br /><em>something bold.</em></h1>
          <p>Your application is in, {data.firstName || 'builder'}. We’ll email <b>{data.email}</b> with everything you need to prepare your pitch.</p>
          <div className="success-actions">
            <Link className="primary" to="/">Back to home <span>↗</span></Link>
            <Link className="ghost-button dark" to="/ideas">Explore the idea wall</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="register-page">
      <header className="register-nav">
        <Brand />
        <span className="form-count">APPLICATION / 2025</span>
        <Link className="close-button" to="/" aria-label="Close">×</Link>
      </header>

      <div className="form-wrap">
        <aside>
          <div className="section-label">/ ENTER THE TANK</div>
          <h1>Bring the<br /><em>spark.</em></h1>
          <p>Tell us about you, then let’s get your venture pitch-ready.</p>
          <div className="steps">
            {STEP_LABELS.map((label, index) => (
              <button
                key={label}
                className={step === index + 1 ? 'active' : step > index + 1 ? 'done' : ''}
                onClick={() => index + 1 < step && setStep(index + 1)}
                type="button"
              >
                <span>0{index + 1}</span>{label}
                <b>{step > index + 1 ? '✓' : ''}</b>
              </button>
            ))}
          </div>
        </aside>

        <form onSubmit={(e) => { e.preventDefault(); goNext() }} noValidate>
          <div className="form-kicker">STEP 0{step} / 05</div>

          {step === 1 && (
            <>
              <h2>Let’s start with<br /><span>you.</span></h2>
              <div className="input-grid">
                <Field label="First name" error={errors.firstName}><input value={data.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="e.g. Amina" /></Field>
                <Field label="Last name" error={errors.lastName}><input value={data.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="e.g. Ben Ali" /></Field>
                <Field label="Email address" error={errors.email}><input type="email" value={data.email} onChange={(e) => update('email', e.target.value)} placeholder="you@email.com" /></Field>
                <Field label="Phone number" error={errors.phone}><input value={data.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+216" /></Field>
                <Field label="Age" error={errors.age}><input type="number" value={data.age} onChange={(e) => update('age', e.target.value)} placeholder="24" /></Field>
                <Field label="City" error={errors.city}><input value={data.city} onChange={(e) => update('city', e.target.value)} placeholder="Sousse" /></Field>
                <Field label="Country" error={errors.country}><input value={data.country} onChange={(e) => update('country', e.target.value)} placeholder="Tunisia" /></Field>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2>Your world of<br /><span>work.</span></h2>
              <div className="input-grid">
                <Field label="University"><input value={data.university} onChange={(e) => update('university', e.target.value)} placeholder="Where you learned" /></Field>
                <Field label="Company"><input value={data.company} onChange={(e) => update('company', e.target.value)} placeholder="Where you build" /></Field>
                <Field label="Position"><input value={data.position} onChange={(e) => update('position', e.target.value)} placeholder="Your role" /></Field>
                <Field label="Experience level" error={errors.experience}>
                  <select value={data.experience} onChange={(e) => update('experience', e.target.value)}>
                    <option value="" disabled>Choose one</option>
                    {EXPERIENCE_LEVELS.map((level) => <option key={level}>{level}</option>)}
                  </select>
                </Field>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2>What do you<br /><span>bring?</span></h2>
              <p className="form-hint">Pick the skills you’ll put to work.</p>
              {errors.skills && <p className="field-error">{errors.skills}</p>}
              <div className="skill-grid">
                {SKILLS.map((skill) => (
                  <label key={skill} className={data.skills.includes(skill) ? 'checked' : ''}>
                    <input type="checkbox" checked={data.skills.includes(skill)} onChange={() => toggleSkill(skill)} />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
              <div className="team-toggle">
                <p className="form-hint">Do you already have a team?</p>
                {errors.hasTeam && <p className="field-error">{errors.hasTeam}</p>}
                <div className="pill-choices">
                  {['Yes, we’re a team', 'No, I’m solo'].map((option) => (
                    <button type="button" key={option} className={data.hasTeam === option ? 'active' : ''} onClick={() => update('hasTeam', option)}>{option}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2>Pitch your<br /><span>venture.</span></h2>
              <div className="input-grid single">
                <Field label="Team name (optional)"><input value={data.teamName} onChange={(e) => update('teamName', e.target.value)} placeholder="Something people remember" /></Field>
                <Field label="Track">
                  <select value={data.track} onChange={(e) => update('track', e.target.value)}>
                    <option value="" disabled>Choose your arena</option>
                    {TRACKS.map((track) => <option key={track.id}>{track.name}</option>)}
                  </select>
                </Field>
                <Field label="Your idea" error={errors.idea}><textarea value={data.idea} onChange={(e) => update('idea', e.target.value)} placeholder="What are you building?" /></Field>
                <Field label="Problem statement" error={errors.problem}><textarea value={data.problem} onChange={(e) => update('problem', e.target.value)} placeholder="Who has this problem, and why does it matter?" /></Field>
              </div>
              <label className="inline-check">
                <input type="checkbox" checked={data.lookingForTeammates} onChange={(e) => update('lookingForTeammates', e.target.checked)} />
                <span>Show my idea on the Idea Wall to find teammates</span>
              </label>
            </>
          )}

          {step === 5 && (
            <>
              <h2>One last<br /><span>look.</span></h2>
              <div className="review">
                <ReviewRow label="Name" value={`${data.firstName} ${data.lastName}`.trim() || '—'} />
                <ReviewRow label="Email" value={data.email || '—'} />
                <ReviewRow label="Location" value={[data.city, data.country].filter(Boolean).join(', ') || '—'} />
                <ReviewRow label="Experience" value={data.experience || '—'} />
                <ReviewRow label="Skills" value={data.skills.join(', ') || '—'} />
                <ReviewRow label="Team" value={data.hasTeam || '—'} />
                <ReviewRow label="Track" value={data.track || '—'} />
                <ReviewRow label="Idea" value={data.idea || '—'} />
              </div>
              <label className={`inline-check ${errors.acceptRules ? 'has-error' : ''}`}>
                <input type="checkbox" checked={data.acceptRules} onChange={(e) => update('acceptRules', e.target.checked)} />
                <span>I accept the event rules and privacy policy.</span>
              </label>
              {errors.acceptRules && <p className="field-error">{errors.acceptRules}</p>}
            </>
          )}

          <div className="form-actions">
            {step > 1 && <button type="button" className="back-button" onClick={() => setStep(step - 1)}>← Back</button>}
            <button className="primary" type="submit" disabled={isSubmitting}>
              {step === 5 ? (isSubmitting ? 'Submitting...' : 'Submit application') : 'Continue'} <span>↗</span>
            </button>
          </div>
          {submitError && <p className="form-submit-error" role="alert">{submitError}</p>}
        </form>
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className={error ? 'has-error' : ''}>
      {label}
      {children}
      {error && <em className="field-error">{error}</em>}
    </label>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return <p><b>{label}</b><span>{value}</span></p>
}
