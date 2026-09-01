import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Download, LogOut, RefreshCw, Users } from 'lucide-react'
import { Brand } from '../components/Brand'
import { getCurrentUserRole, getDashboardStats, getParticipants, isSupabaseConfigured, type DashboardStats, type ParticipantRecord } from '../services/registrations'
import { supabase } from '../services/supabase'

const EMPTY_STATS: DashboardStats = { participants: 0, teams: 0, projects: 0, mentors: 0, jury: 0, sponsors: 0 }

function toCsvCell(value: unknown): string {
  const text = Array.isArray(value) ? value.join(' | ') : String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

export function Admin() {
  const [authenticated, setAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<ParticipantRecord[]>([])
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [query, setQuery] = useState('')
  const [dataError, setDataError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setDataError('')
    try {
      const role = await getCurrentUserRole()
      if (role !== 'admin') throw new Error('This account is not an organizer account. Ask an admin to assign it the admin role in Supabase.')
      const [nextStats, nextRecords] = await Promise.all([getDashboardStats(), getParticipants()])
      setStats(nextStats)
      setRecords(nextRecords)
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setAuthenticated(Boolean(data.session)))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setAuthenticated(Boolean(session)))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (authenticated) void loadDashboard()
  }, [authenticated])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return records
    return records.filter((record) =>
      [record.first_name, record.last_name, record.email, record.city, record.experience_level, ...record.skills]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
  }, [records, query])

  const login = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setLoading(true)
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setAuthError(error.message)
  }

  const logout = async () => {
    await supabase?.auth.signOut()
    setRecords([])
    setStats(EMPTY_STATS)
  }

  const exportCsv = () => {
    const columns = [
      ['created_at', 'Submitted at'], ['first_name', 'First name'], ['last_name', 'Last name'],
      ['email', 'Email'], ['phone', 'Phone'], ['age', 'Age'], ['city', 'City'], ['country', 'Country'],
      ['school', 'School'], ['company', 'Company'], ['position', 'Position'], ['experience_level', 'Experience'],
      ['skills', 'Skills'], ['has_team', 'Has team'], ['looking_for_teammates', 'Looking for teammates'],
    ] as const
    const csv = [
      columns.map(([, label]) => toCsvCell(label)).join(','),
      ...records.map((record) => columns.map(([key]) => toCsvCell(record[key])).join(',')),
    ].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `hacktank-participants-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!isSupabaseConfigured) {
    return <AdminNotice title="Supabase setup required" text="Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart the development server." />
  }

  if (!authenticated) {
    return (
      <div className="admin-login">
        <form onSubmit={login} className="admin-login-card">
          <Brand />
          <div className="section-label">/ ORGANIZER ACCESS</div>
          <h1>Admin<br /><span>login.</span></h1>
          <p>Sign in with the organizer account created in Supabase.</p>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Organizer email" autoComplete="email" required />
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" autoComplete="current-password" required />
          {authError && <span className="field-error" role="alert">{authError}</span>}
          <button className="primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Unlock'} <span>↗</span></button>
        </form>
      </div>
    )
  }

  const cards = [
    ['Participants', stats.participants, 'Registered builders'], ['Teams', stats.teams, 'Teams in the Tank'],
    ['Projects', stats.projects, 'Ventures submitted'], ['Mentors', stats.mentors, 'Mentors available'],
    ['Jury', stats.jury, 'Sharks on the panel'], ['Sponsors', stats.sponsors, 'Supporting partners'],
  ]

  return (
    <div className="admin-page">
      <header className="admin-nav">
        <Brand />
        <span className="form-count">ADMIN / DASHBOARD</span>
        <div className="admin-actions">
          <button onClick={() => void loadDashboard()} className="admin-btn" disabled={loading}><RefreshCw size={15} /> Refresh</button>
          <button onClick={exportCsv} className="admin-btn primary-btn" disabled={!records.length}><Download size={15} /> Export CSV</button>
          <button onClick={() => void logout()} className="admin-btn"><LogOut size={15} /> Logout</button>
        </div>
      </header>

      <div className="admin-body">
        <div className="admin-head">
          <div>
            <div className="section-label">/ EVENT CONTROL ROOM</div>
            <h1>Hack Tank <span>dashboard.</span></h1>
          </div>
          <div className="admin-status"><Users size={16} /> {loading ? 'Syncing data...' : 'Live Supabase data'}</div>
        </div>

        {dataError && <p className="admin-alert" role="alert">{dataError}</p>}

        <section className="admin-stats">
          {cards.map(([label, value, detail]) => (
            <div className="admin-stat-card" key={String(label)}>
              <span>{label}</span><strong>{value}</strong><small>{detail}</small>
            </div>
          ))}
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <div><h2>Participants</h2><p>All applications submitted through the public registration form.</p></div>
            <input className="admin-search" placeholder="Search name, email, city, skill..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>City</th><th>Experience</th><th>Skills</th><th>Team</th><th>Submitted</th></tr></thead>
              <tbody>
                {filtered.map((record, index) => (
                  <tr key={record.id}>
                    <td>{index + 1}</td><td>{record.first_name} {record.last_name}</td><td>{record.email}</td>
                    <td>{record.city}, {record.country}</td><td>{record.experience_level || '—'}</td>
                    <td>{record.skills.join(', ') || '—'}</td><td>{record.has_team ? 'Yes' : 'Solo'}</td>
                    <td>{new Date(record.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && !filtered.length && <p className="admin-note">No participants found.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}

function AdminNotice({ title, text }: { title: string; text: string }) {
  return <div className="admin-login"><div className="admin-login-card"><Brand /><div className="section-label">/ SETUP</div><h1>{title}</h1><p>{text}</p></div></div>
}
