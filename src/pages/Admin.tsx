import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, LogOut, Pencil, Plus, RefreshCw, Save, Trash2, Users, X } from 'lucide-react'
import { Brand } from '../components/Brand'
import { addParticipantToTeam, createJuryMember, deleteJuryMember, deleteTeam, getCurrentUserRole, getDashboardStats, getJuryMembers, getParticipants, getTeams, isSupabaseConfigured, setTeamLeader, updateJuryMember, updateProject, updateTeam, type DashboardStats, type JuryMemberRecord, type ParticipantRecord, type TeamRecord } from '../services/registrations'
import { supabase } from '../services/supabase'

const EMPTY_STATS: DashboardStats = { participants: 0, teams: 0, projects: 0, mentors: 0, jury: 0, sponsors: 0 }

function toCsvCell(value: unknown): string {
  const text = Array.isArray(value) ? value.join(' | ') : String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

export function Admin() {
  const navigate = useNavigate()
  const [authenticated, setAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<ParticipantRecord[]>([])
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [query, setQuery] = useState('')
  const [dataError, setDataError] = useState('')
  const [juryMembers, setJuryMembers] = useState<JuryMemberRecord[]>([])
  const [teams, setTeams] = useState<TeamRecord[]>([])
  const [juryQuery, setJuryQuery] = useState('')
  const [teamQuery, setTeamQuery] = useState('')
  const [juryDraft, setJuryDraft] = useState({ full_name: '', company: '', position: '' })
  const [editingJuryId, setEditingJuryId] = useState<string | null>(null)
  const [teamDraft, setTeamDraft] = useState({ team_name: '', slogan: '' })
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [teamProjectDraft, setTeamProjectDraft] = useState({ project_name: '', category: '', description: '', problem_statement: '', solution: '' })
  const [teamMemberDrafts, setTeamMemberDrafts] = useState<Record<string, string>>({})

  const loadDashboard = async () => {
    setLoading(true)
    setDataError('')
    try {
      const role = await getCurrentUserRole()
      if (role !== 'admin') {
        navigate(role === 'jury' ? '/jury' : role === 'participant' ? '/team' : '/', { replace: true })
        return
      }
      const [nextStats, nextRecords, nextJuryMembers, nextTeams] = await Promise.all([
        getDashboardStats(), getParticipants(), getJuryMembers(), getTeams(),
      ])
      setStats(nextStats)
      setRecords(nextRecords)
      setJuryMembers(nextJuryMembers)
      setTeams(nextTeams)
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
    setJuryMembers([])
    setTeams([])
  }

  const saveJury = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setDataError('')
    try {
      const values = { full_name: juryDraft.full_name.trim(), company: juryDraft.company.trim(), position: juryDraft.position.trim() }
      if (!values.full_name) throw new Error('Jury name is required.')
      const saved = editingJuryId ? await updateJuryMember(editingJuryId, values) : await createJuryMember(values)
      setJuryMembers((current) => editingJuryId ? current.map((member) => member.id === editingJuryId ? saved : member) : [...current, saved].sort((a, b) => a.full_name.localeCompare(b.full_name)))
      setJuryDraft({ full_name: '', company: '', position: '' })
      setEditingJuryId(null)
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to save jury member.')
    } finally {
      setLoading(false)
    }
  }

  const removeJury = async (member: JuryMemberRecord) => {
    if (!window.confirm(`Delete jury member ${member.full_name}? Existing scores will also be deleted.`)) return
    setLoading(true)
    try {
      await deleteJuryMember(member.id)
      setJuryMembers((current) => current.filter((item) => item.id !== member.id))
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to delete jury member.')
    } finally {
      setLoading(false)
    }
  }

  const saveTeam = async (event: FormEvent) => {
    event.preventDefault()
    if (!editingTeamId) return
    setLoading(true)
    try {
      const saved = await updateTeam(editingTeamId, { team_name: teamDraft.team_name.trim(), slogan: teamDraft.slogan.trim() })
      setTeams((current) => current.map((team) => team.id === editingTeamId ? { ...team, ...saved } : team))
      setEditingTeamId(null)
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to save team.')
    } finally {
      setLoading(false)
    }
  }

  const removeTeam = async (team: TeamRecord) => {
    if (!window.confirm(`Delete team ${team.team_name}? Its project will be kept without a team.`)) return
    setLoading(true)
    try {
      await deleteTeam(team.id)
      setTeams((current) => current.filter((item) => item.id !== team.id))
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to delete team.')
    } finally {
      setLoading(false)
    }
  }

  const addMemberToTeam = async (team: TeamRecord) => {
    const participantId = teamMemberDrafts[team.id]
    if (!participantId) return
    setLoading(true)
    try {
      await addParticipantToTeam(team.id, participantId)
      setTeamMemberDrafts((current) => ({ ...current, [team.id]: '' }))
      await loadDashboard()
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to add participant to team.')
      setLoading(false)
    }
  }

  const changeLeader = async (team: TeamRecord, participantId: string) => {
    setLoading(true)
    try {
      await setTeamLeader(team.id, participantId)
      await loadDashboard()
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to change team leader.')
      setLoading(false)
    }
  }

  const saveProject = async (team: TeamRecord) => {
    if (!team.project) return
    setLoading(true)
    try {
      const saved = await updateProject(team.project.id, teamProjectDraft)
      setTeams((current) => current.map((item) => item.id === team.id ? { ...item, project: saved } : item))
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to save project.')
    } finally {
      setLoading(false)
    }
  }

  const filteredJury = useMemo(() => {
    const normalized = juryQuery.trim().toLowerCase()
    if (!normalized) return juryMembers
    return juryMembers.filter((member) => [member.full_name, member.company, member.position].join(' ').toLowerCase().includes(normalized))
  }, [juryMembers, juryQuery])

  const filteredTeams = useMemo(() => {
    const normalized = teamQuery.trim().toLowerCase()
    if (!normalized) return teams
    return teams.filter((team) => [team.team_name, team.slogan, team.project?.project_name, ...team.members.flatMap((member) => [member.name, member.email])].join(' ').toLowerCase().includes(normalized))
  }, [teams, teamQuery])

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
            <div><h2>Jury management</h2><p>Create, edit or remove jury profiles. Account passwords remain managed by Supabase Auth.</p></div>
            <input className="admin-search" placeholder="Search jury..." value={juryQuery} onChange={(event) => setJuryQuery(event.target.value)} />
          </div>
          <form className="admin-inline-form" onSubmit={saveJury}>
            <input placeholder="Full name" value={juryDraft.full_name} onChange={(event) => setJuryDraft({ ...juryDraft, full_name: event.target.value })} required />
            <input placeholder="Company" value={juryDraft.company} onChange={(event) => setJuryDraft({ ...juryDraft, company: event.target.value })} />
            <input placeholder="Position" value={juryDraft.position} onChange={(event) => setJuryDraft({ ...juryDraft, position: event.target.value })} />
            <button className="admin-btn primary-btn" type="submit" disabled={loading}>{editingJuryId ? <Save size={15} /> : <Plus size={15} />}{editingJuryId ? 'Save' : 'Add jury'}</button>
            {editingJuryId && <button className="admin-btn" type="button" onClick={() => { setEditingJuryId(null); setJuryDraft({ full_name: '', company: '', position: '' }) }}><X size={15} /> Cancel</button>}
          </form>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Company</th><th>Position</th><th>Account</th><th>Actions</th></tr></thead>
              <tbody>{filteredJury.map((member) => (
                <tr key={member.id}>
                  <td>{member.full_name}</td><td>{member.company || '—'}</td><td>{member.position || '—'}</td><td>{member.user_id ? 'Linked' : 'No account'}</td>
                  <td className="admin-row-actions"><button className="admin-icon-btn" title="Edit jury" onClick={() => { setEditingJuryId(member.id); setJuryDraft({ full_name: member.full_name, company: member.company || '', position: member.position || '' }) }}><Pencil size={15} /></button><button className="admin-icon-btn danger" title="Delete jury" onClick={() => void removeJury(member)}><Trash2 size={15} /></button></td>
                </tr>
              ))}</tbody>
            </table>
            {!filteredJury.length && <p className="admin-note">No jury members found.</p>}
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <div><h2>Teams</h2><p>Review members and projects, update team details, or remove a team.</p></div>
            <input className="admin-search" placeholder="Search team, member or project..." value={teamQuery} onChange={(event) => setTeamQuery(event.target.value)} />
          </div>
          {editingTeamId && <form className="admin-inline-form" onSubmit={saveTeam}>
            <input placeholder="Team name" value={teamDraft.team_name} onChange={(event) => setTeamDraft({ ...teamDraft, team_name: event.target.value })} required />
            <input placeholder="Slogan" value={teamDraft.slogan} onChange={(event) => setTeamDraft({ ...teamDraft, slogan: event.target.value })} />
            <button className="admin-btn primary-btn" type="submit" disabled={loading}><Save size={15} /> Save team</button>
            <input placeholder="Project name" value={teamProjectDraft.project_name} onChange={(event) => setTeamProjectDraft({ ...teamProjectDraft, project_name: event.target.value })} />
            <input placeholder="Project category" value={teamProjectDraft.category} onChange={(event) => setTeamProjectDraft({ ...teamProjectDraft, category: event.target.value })} />
            <textarea className="admin-project-input" placeholder="Project description" value={teamProjectDraft.description} onChange={(event) => setTeamProjectDraft({ ...teamProjectDraft, description: event.target.value })} />
            <textarea className="admin-project-input" placeholder="Problem statement" value={teamProjectDraft.problem_statement} onChange={(event) => setTeamProjectDraft({ ...teamProjectDraft, problem_statement: event.target.value })} />
            <textarea className="admin-project-input" placeholder="Solution" value={teamProjectDraft.solution} onChange={(event) => setTeamProjectDraft({ ...teamProjectDraft, solution: event.target.value })} />
            <button className="admin-btn primary-btn" type="button" disabled={loading} onClick={() => { const team = teams.find((item) => item.id === editingTeamId); if (team) void saveProject(team) }}><Save size={15} /> Save project</button>
            <button className="admin-btn" type="button" onClick={() => setEditingTeamId(null)}><X size={15} /> Cancel</button>
          </form>}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Team</th><th>Members</th><th>Project</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>{filteredTeams.map((team) => (
                <tr key={team.id}>
                  <td><strong>{team.team_name}</strong>{team.slogan && <small className="admin-cell-subtitle">{team.slogan}</small>}</td>
                  <td><div className="admin-member-list">{team.members.length ? team.members.map((member) => <span key={member.participant_id}>{member.name}{member.is_leader ? ' (leader)' : ''}<small>{member.email}</small>{!member.is_leader && <button className="admin-text-btn" onClick={() => void changeLeader(team, member.participant_id)}>Make leader</button>}</span>) : 'No members'}</div><div className="admin-member-add"><select value={teamMemberDrafts[team.id] || ''} onChange={(event) => setTeamMemberDrafts((current) => ({ ...current, [team.id]: event.target.value }))}><option value="">Add participant...</option>{records.filter((record) => !team.members.some((member) => member.participant_id === record.id)).map((record) => <option value={record.id} key={record.id}>{record.first_name} {record.last_name}</option>)}</select><button className="admin-text-btn" onClick={() => void addMemberToTeam(team)}>Add</button></div></td>
                  <td><strong>{team.project?.project_name || '—'}</strong>{team.project?.category && <small className="admin-cell-subtitle">{team.project.category}</small>}{team.project && <button className="admin-text-btn" onClick={() => { setTeamProjectDraft({ project_name: team.project?.project_name || '', category: team.project?.category || '', description: team.project?.description || '', problem_statement: team.project?.problem_statement || '', solution: team.project?.solution || '' }); setEditingTeamId(team.id) }}>Edit project</button>}</td>
                  <td>{new Date(team.created_at).toLocaleDateString()}</td>
                  <td className="admin-row-actions"><button className="admin-icon-btn" title="Edit team" onClick={() => { setEditingTeamId(team.id); setTeamDraft({ team_name: team.team_name, slogan: team.slogan || '' }) }}><Pencil size={15} /></button><button className="admin-icon-btn danger" title="Delete team" onClick={() => void removeTeam(team)}><Trash2 size={15} /></button></td>
                </tr>
              ))}</tbody>
            </table>
            {!filteredTeams.length && <p className="admin-note">No teams found.</p>}
          </div>
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
