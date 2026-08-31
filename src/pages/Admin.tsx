import { useMemo, useState } from 'react'
import { Download, RefreshCw, Trash2 } from 'lucide-react'
import { Brand } from '../components/Brand'
import type { RegistrationData } from '../types'

const LIST_KEY = 'hacktank-registration-list'

type Submission = RegistrationData & { submittedAt: string }

function loadSubmissions(): Submission[] {
  try {
    return JSON.parse(localStorage.getItem(LIST_KEY) || '[]')
  } catch {
    return []
  }
}

const CSV_COLUMNS: { key: keyof Submission; label: string }[] = [
  { key: 'submittedAt', label: 'Submitted at' },
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'age', label: 'Age' },
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'university', label: 'University' },
  { key: 'company', label: 'Company' },
  { key: 'position', label: 'Position' },
  { key: 'experience', label: 'Experience' },
  { key: 'skills', label: 'Skills' },
  { key: 'hasTeam', label: 'Team' },
  { key: 'teamName', label: 'Team name' },
  { key: 'track', label: 'Track' },
  { key: 'idea', label: 'Idea' },
  { key: 'problem', label: 'Problem' },
]

function toCsvCell(value: unknown): string {
  const text = Array.isArray(value) ? value.join(' | ') : String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

export function Admin() {
  const [submissions, setSubmissions] = useState<Submission[]>(loadSubmissions)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return submissions
    return submissions.filter((s) =>
      [s.firstName, s.lastName, s.email, s.city, s.track, s.teamName]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [submissions, query])

  const refresh = () => setSubmissions(loadSubmissions())

  const exportCsv = () => {
    const header = CSV_COLUMNS.map((col) => toCsvCell(col.label)).join(',')
    const rows = submissions.map((s) => CSV_COLUMNS.map((col) => toCsvCell(s[col.key])).join(','))
    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `hacktank-registrations-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    if (!window.confirm('Delete all registrations stored in this browser? This cannot be undone.')) return
    localStorage.removeItem(LIST_KEY)
    setSubmissions([])
  }

  return (
    <div className="admin-page">
      <header className="admin-nav">
        <Brand />
        <span className="form-count">ADMIN / REGISTRATIONS</span>
        <div className="admin-actions">
          <button onClick={refresh} className="admin-btn"><RefreshCw size={15} /> Refresh</button>
          <button onClick={exportCsv} className="admin-btn primary-btn" disabled={submissions.length === 0}><Download size={15} /> Export CSV</button>
          <button onClick={clearAll} className="admin-btn danger" disabled={submissions.length === 0}><Trash2 size={15} /> Clear</button>
        </div>
      </header>

      <div className="admin-body">
        <div className="admin-head">
          <div>
            <div className="section-label">/ REGISTRATIONS</div>
            <h1>{submissions.length} <span>applicant{submissions.length === 1 ? '' : 's'}</span></h1>
          </div>
          <input
            className="admin-search"
            placeholder="Search name, email, track…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <p className="admin-note">
          Registrations are stored in this browser only (localStorage). To collect entries from every
          device once deployed, connect the form to a backend or a Google Sheet.
        </p>

        {submissions.length === 0 ? (
          <div className="admin-empty">
            <p>No registrations yet.</p>
            <span>Submitted applications from this browser will appear here.</span>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Experience</th>
                  <th>Track</th>
                  <th>Team</th>
                  <th>Skills</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, index) => (
                  <tr key={s.email + index}>
                    <td>{index + 1}</td>
                    <td>{`${s.firstName} ${s.lastName}`.trim() || '—'}</td>
                    <td>{s.email || '—'}</td>
                    <td>{[s.city, s.country].filter(Boolean).join(', ') || '—'}</td>
                    <td>{s.experience || '—'}</td>
                    <td>{s.track || '—'}</td>
                    <td>{s.hasTeam || '—'}</td>
                    <td>{s.skills?.join(', ') || '—'}</td>
                    <td>{new Date(s.submittedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="admin-note">No applicant matches “{query}”.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
