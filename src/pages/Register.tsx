import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Brand } from '../components/Brand'
import type { RegistrationData } from '../types'
import { isSupabaseConfigured, submitRegistration } from '../services/registrations'

const STEP_LABELS = ['Participant', 'Team', 'Review']
const STORAGE_KEY = 'hacktank-registration'

const emptyMember: RegistrationData['teamMembers'][number] = {
  firstName: '', lastName: '', email: '', phone: '', age: '',
  profileType: 'student', university: '', company: '', position: '',
}

const emptyData: RegistrationData = {
  firstName: '', lastName: '', email: '', phone: '', age: '',
  profileType: 'student',
  university: '', company: '', position: '',
  hasTeam: 'Yes, we’re a team',
  teamName: '', acceptRules: false,
  paymentMethod: '', paymentReference: '', paymentCommitment: false,
  teamMembers: [emptyMember],
}

function loadDraft(): RegistrationData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY + '-draft')
    if (raw) {
      const draft = JSON.parse(raw) as Partial<RegistrationData>
      return {
        ...emptyData,
        ...draft,
        hasTeam: 'Yes, we’re a team',
        teamMembers: (draft.teamMembers ?? emptyData.teamMembers).map((member) => ({ ...emptyMember, ...member })),
      }
    }
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
  const [paymentEmailError, setPaymentEmailError] = useState('')
  const [data, setData] = useState<RegistrationData>(loadDraft)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationInput, setVerificationInput] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [verificationModalOpen, setVerificationModalOpen] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isCheckingCode, setIsCheckingCode] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState('')
  const [isDemoVerification, setIsDemoVerification] = useState(false)

  const update = <K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => {
    setData((prev) => {
      const next = { ...prev, [key]: value }
      try { localStorage.setItem(STORAGE_KEY + '-draft', JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const updateMember = (index: number, field: keyof RegistrationData['teamMembers'][number], value: string) => {
    setData((prev) => {
      const nextMembers = [...prev.teamMembers]
      nextMembers[index] = { ...nextMembers[index], [field]: value }
      const next = { ...prev, teamMembers: nextMembers }
      try { localStorage.setItem(STORAGE_KEY + '-draft', JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
    setErrors((prev) => ({ ...prev, [`member-${index}-${field}`]: '' }))
  }

  const requestEmailVerification = async () => {
    if (!emailPattern.test(data.email)) {
      setErrors((prev) => ({ ...prev, email: 'Enter a valid email' }))
      return
    }

    const code = String(Math.floor(100000 + Math.random() * 900000))
    setIsSendingCode(true)
    setVerificationMessage('')
    setVerificationCode('')
    setIsDemoVerification(false)

    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, code }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to send verification code.')
      }

      setVerificationCode(code)
      setVerificationInput('')
      setVerificationMessage('A 6-digit code was sent to your email.')
      setEmailVerified(false)
      setVerificationModalOpen(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send verification code.'
      setVerificationInput('')
      setVerificationCode('')
      setVerificationMessage(message)
      setEmailVerified(false)
      setVerificationModalOpen(true)
    } finally {
      setIsSendingCode(false)
    }
  }

  const verifyEmailCode = async () => {
    if (!verificationInput.trim()) {
      setVerificationMessage('Enter the 6-digit code.')
      return
    }

    if (verificationInput.trim() !== verificationCode) {
      setVerificationMessage('The code you entered is incorrect.')
      return
    }

    setIsCheckingCode(true)
    setTimeout(() => {
      setEmailVerified(true)
      setVerificationModalOpen(false)
      setVerificationInput('')
      setVerificationMessage('')
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setIsCheckingCode(false)
    }, 250)
  }

  const addTeamMember = () => {
    setData((prev) => {
      const next = { ...prev, teamMembers: [...prev.teamMembers, { ...emptyMember }] }
      try { localStorage.setItem(STORAGE_KEY + '-draft', JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }

  const removeTeamMember = (index: number) => {
    if (data.teamMembers.length <= 1) return
    setData((prev) => {
      const nextMembers = prev.teamMembers.filter((_, memberIndex) => memberIndex !== index)
      const next = { ...prev, teamMembers: nextMembers }
      try { localStorage.setItem(STORAGE_KEY + '-draft', JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }

  const validateStep = (): boolean => {
    const next: Record<string, string> = {}
    if (step === 1) {
      if (!data.firstName.trim()) next.firstName = 'Required'
      if (!data.lastName.trim()) next.lastName = 'Required'
      if (!emailPattern.test(data.email)) next.email = 'Enter a valid email'
      if (!data.phone.trim()) next.phone = 'Required'
      if (!data.age || Number(data.age) < 15 || Number(data.age) > 99) next.age = 'Enter a valid age'
    }
    if (step === 1) {
      if (data.profileType === 'student') {
        if (!data.university.trim()) next.university = 'Required'
        if (!data.position.trim()) next.position = 'Required'
      } else {
        if (!data.company.trim()) next.company = 'Required'
        if (!data.position.trim()) next.position = 'Required'
      }
    }
    if (step === 2) {
      if (!data.teamName.trim()) next.teamName = 'Team name is required'
      if (!data.paymentMethod) next.paymentMethod = 'Choose a payment method'
      if (!data.paymentCommitment) next.paymentCommitment = 'Please confirm your payment commitment'

      data.teamMembers.forEach((member, index) => {
        const baseKey = `member-${index}`
        if (!member.firstName.trim()) next[`${baseKey}-firstName`] = 'Required'
        if (!member.lastName.trim()) next[`${baseKey}-lastName`] = 'Required'
        if (!emailPattern.test(member.email)) next[`${baseKey}-email`] = 'Enter a valid email'
        if (!member.phone.trim()) next[`${baseKey}-phone`] = 'Required'
        if (!member.age || Number(member.age) < 15 || Number(member.age) > 99) next[`${baseKey}-age`] = 'Enter a valid age'
        if (member.profileType === 'student') {
          if (!member.university.trim()) next[`${baseKey}-university`] = 'Required'
          if (!member.position.trim()) next[`${baseKey}-position`] = 'Required'
        } else {
          if (!member.company.trim()) next[`${baseKey}-company`] = 'Required'
          if (!member.position.trim()) next[`${baseKey}-position`] = 'Required'
        }
      })
    }
    if (step === 3) {
      if (!data.acceptRules) next.acceptRules = 'Please accept to continue'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const goNext = async () => {
    if (!validateStep()) return

    if (step === 1) {
      if (!emailVerified) {
        await requestEmailVerification()
        return
      }
    }

    if (step < 3) {
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
    setPaymentEmailError('')
    try {
      await submitRegistration(data)

      try {
        const response = await fetch('/api/send-payment-instructions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: data.paymentMethod,
            recipients: [data.email, ...data.teamMembers.map((member) => member.email)],
          }),
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload?.error || 'Unable to send payment instructions.')
        }
      } catch {
        setPaymentEmailError('Your registration was saved, but we could not email the payment instructions. Please contact the organizers.')
      }

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
          <p>Your application is received, {data.firstName || 'builder'}. It will remain pending until your payment is verified. Payment instructions were sent to the email addresses provided.</p>
          {paymentEmailError && <p className="form-submit-error" role="alert">{paymentEmailError}</p>}
          <div className="success-actions">
            <Link className="primary" to="/">Back to home <span>↗</span></Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="register-page">
      <header className="register-nav">
        <Brand />
        <span className="form-count">APPLICATION / 2026</span>
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
          <div className="form-kicker">STEP 0{step} / 03</div>

          {step === 1 && (
            <>
              <h2>Let’s start with<br /><span>you.</span></h2>
              <div className="input-grid">
                <Field label="First name" error={errors.firstName}><input value={data.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="e.g. Amina" /></Field>
                <Field label="Last name" error={errors.lastName}><input value={data.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="e.g. Ben Ali" /></Field>
                <Field label="Email address" error={errors.email}><input type="email" value={data.email} onChange={(e) => {
                  update('email', e.target.value)
                  if (emailVerified) {
                    setEmailVerified(false)
                    setVerificationCode('')
                    setVerificationInput('')
                  }
                }} placeholder="you@email.com" /></Field>
                <Field label="Phone number" error={errors.phone}><input value={data.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+216" /></Field>
                <Field label="Age" error={errors.age}><input type="number" value={data.age} onChange={(e) => update('age', e.target.value)} placeholder="24" /></Field>
              </div>
              <ProfileFields
                value={data}
                errors={errors}
                onChange={(field, value) => update(field, value as RegistrationData[typeof field])}
              />
            </>
          )}

          {step === 2 && (
            <>
              <h2>Team up for<br /><span>the Tank.</span></h2>
              <div className="input-grid single">
                <Field label="Team name *" error={errors.teamName}><input value={data.teamName} onChange={(e) => update('teamName', e.target.value)} placeholder="Something people remember" /></Field>
                <Field label="Payment method *" error={errors.paymentMethod}>
                  <select
                    value={data.paymentMethod}
                    onChange={(e) => update('paymentMethod', e.target.value)}
                    required
                    aria-invalid={Boolean(errors.paymentMethod)}
                  >
                    <option value="" disabled>Select a method</option>
                    <option value="Bank transfer">Bank transfer</option>
                    <option value="Organizer payment">Payment to an organizer</option>
                  </select>
                </Field>
              </div>

              <div style={{ marginTop: 24, marginBottom: 18 }}>
                <div className="section-label" style={{ marginBottom: 8 }}>/ TEAM MEMBERS</div>
                <p className="form-hint" style={{ margin: 0 }}>Add every teammate. Each member needs their full details before submitting.</p>
              </div>

              {data.teamMembers.map((member, index) => (
                <div key={`member-${index}`} style={{ border: '1px solid #d6dfe8', borderRadius: 14, padding: 18, marginBottom: 16, background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <strong style={{ color: '#0b1928', fontSize: 15 }}>Member {index + 1}</strong>
                    {data.teamMembers.length > 1 && (
                      <button type="button" onClick={() => removeTeamMember(index)} style={{ border: '1px solid #d9e1ea', borderRadius: 999, background: '#fff', color: '#33475c', padding: '0.45rem 0.8rem', cursor: 'pointer', fontWeight: 700 }}>
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="input-grid">
                    <Field label="First name *" error={errors[`member-${index}-firstName`]}>
                      <input value={member.firstName} onChange={(e) => updateMember(index, 'firstName', e.target.value)} placeholder="e.g. Yassine" />
                    </Field>
                    <Field label="Last name *" error={errors[`member-${index}-lastName`]}>
                      <input value={member.lastName} onChange={(e) => updateMember(index, 'lastName', e.target.value)} placeholder="e.g. Ben Ali" />
                    </Field>
                    <Field label="Email address *" error={errors[`member-${index}-email`]}>
                      <input type="email" value={member.email} onChange={(e) => updateMember(index, 'email', e.target.value)} placeholder="teammate@email.com" />
                    </Field>
                    <Field label="Phone number *" error={errors[`member-${index}-phone`]}>
                      <input value={member.phone} onChange={(e) => updateMember(index, 'phone', e.target.value)} placeholder="+216" />
                    </Field>
                    <Field label="Age *" error={errors[`member-${index}-age`]}>
                      <input type="number" value={member.age} onChange={(e) => updateMember(index, 'age', e.target.value)} placeholder="24" />
                    </Field>
                  </div>
                  <ProfileFields
                    value={member}
                    errors={errors}
                    errorPrefix={`member-${index}-`}
                    onChange={(field, value) => updateMember(index, field, value)}
                  />
                </div>
              ))}

              <button type="button" onClick={addTeamMember} style={{ border: '1px solid #3178ca', background: '#eef5ff', color: '#0b1928', borderRadius: 999, padding: '0.8rem 1.1rem', fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
                + Add teammate
              </button>

              <label className={`inline-check ${errors.paymentCommitment ? 'has-error' : ''}`}>
                <input type="checkbox" checked={data.paymentCommitment} onChange={(e) => update('paymentCommitment', e.target.checked)} />
                <span>I commit to paying the participation fee before the deadline. I understand that my registration remains pending until payment is verified.</span>
              </label>
              {errors.paymentCommitment && <p className="field-error">{errors.paymentCommitment}</p>}
            </>
          )}

          {step === 3 && (
            <>
              <h2>One last<br /><span>look.</span></h2>
              <div className="review">
                <ReviewRow label="Name" value={`${data.firstName} ${data.lastName}`.trim() || '—'} />
                <ReviewRow label="Email" value={data.email || '—'} />
                <ReviewRow label="Profile" value={data.profileType === 'student' ? 'Student' : 'Professional / Other'} />
                <ReviewRow label={data.profileType === 'student' ? 'School or university' : 'Current company'} value={data.profileType === 'student' ? (data.university || '—') : (data.company || '—')} />
                <ReviewRow label={data.profileType === 'student' ? 'Specialty' : 'Current role'} value={data.position || '—'} />
                <ReviewRow label="Team" value={data.teamName || '—'} />
                <ReviewRow label="Payment" value={data.paymentMethod || '—'} />
                <ReviewRow label="Teammates" value={String(data.teamMembers.length)} />
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
            <button className="primary" type="submit" disabled={isSubmitting || isSendingCode || isCheckingCode}>
              {step === 3 ? (isSubmitting ? 'Submitting...' : 'Submit application') : (isSendingCode ? 'Sending code...' : 'Continue')} <span>↗</span>
            </button>
          </div>
          {submitError && <p className="form-submit-error" role="alert">{submitError}</p>}
        </form>
      </div>

      {verificationModalOpen && (
        <div className="verification-modal-backdrop" onClick={() => setVerificationModalOpen(false)}>
          <div className="verification-modal" onClick={(event) => event.stopPropagation()}>
            <div className="section-label">/ EMAIL VERIFICATION</div>
            <h3>Enter the code we sent</h3>
            <p>We sent a 6-digit verification code to <strong>{data.email}</strong>.</p>
            {isDemoVerification && <p className="demo-verification-note">Demo mode is active. Use this code: <strong>{verificationCode}</strong></p>}
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verificationInput}
              onChange={(event) => setVerificationInput(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              aria-label="Verification code"
            />
            {verificationMessage && <p className="verification-message">{verificationMessage}</p>}
            <div className="verification-actions">
              <button type="button" className="back-button" onClick={() => setVerificationModalOpen(false)}>Cancel</button>
              <button type="button" className="primary" onClick={verifyEmailCode} disabled={isCheckingCode}>
                {isCheckingCode ? 'Verifying...' : 'Verify'} <span>↗</span>
              </button>
            </div>
            <button type="button" className="text-link" onClick={requestEmailVerification} disabled={isSendingCode}>
              {isSendingCode ? 'Sending...' : 'Resend code'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

type ProfileFieldKey = 'profileType' | 'university' | 'company' | 'position'

function ProfileFields({
  value,
  errors,
  errorPrefix = '',
  onChange,
}: {
  value: Pick<RegistrationData, ProfileFieldKey>
  errors: Record<string, string>
  errorPrefix?: string
  onChange: (field: ProfileFieldKey, value: string) => void
}) {
  const options = [
    { value: 'student', label: 'Student' },
    { value: 'other', label: 'Professional / Other' },
  ] as const

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }} role="group" aria-label="Profile type">
        {options.map((option) => {
          const selected = value.profileType === option.value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                if (option.value === 'student') onChange('position', '')
                onChange('profileType', option.value)
              }}
              style={{
                border: `1px solid ${selected ? '#0b1928' : '#d6dfe8'}`,
                borderRadius: 6,
                background: selected ? '#0b1928' : 'transparent',
                color: selected ? '#fff' : '#33475c',
                padding: '7px 10px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      <div className="input-grid">
        {value.profileType === 'student' ? (
          <>
            <Field label="School or university *" error={errors[`${errorPrefix}university`]}>
              <input value={value.university} onChange={(event) => onChange('university', event.target.value)} placeholder="e.g. University of Sousse" />
            </Field>
            <Field label="Specialty *" error={errors[`${errorPrefix}position`]}>
              <input value={value.position} onChange={(event) => onChange('position', event.target.value)} placeholder="e.g. Computer Science" />
            </Field>
          </>
        ) : (
          <Field label="Current company *" error={errors[`${errorPrefix}company`]}>
            <input value={value.company} onChange={(event) => onChange('company', event.target.value)} placeholder="e.g. Acme or freelance" />
          </Field>
        )}
        {value.profileType === 'other' && (
          <Field label="Current role *" error={errors[`${errorPrefix}position`]}>
            <input value={value.position} onChange={(event) => onChange('position', event.target.value)} placeholder="e.g. Developer, Founder" />
          </Field>
        )}
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
