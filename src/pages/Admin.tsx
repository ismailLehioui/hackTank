import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Download, Gavel, Image, LayoutDashboard, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Pencil, Plus, RefreshCw, Save, Trash2, Users, UserPlus, UserRound, UsersRound, X } from 'lucide-react'
import { Brand } from '../components/Brand'
import { createJuryMember, createParticipantForTeam, createTeamWithLeader, deleteJuryMember, deleteParticipantRecord, deleteTeam, DEFAULT_SITE_SETTINGS, getCurrentUserRole, getDashboardStats, getJuryMembers, getParticipants, getSiteSettings, getTeams, isSupabaseConfigured, removeParticipantFromTeam, saveSiteSettings, saveTeamProject, setTeamLeader, updateJuryMember, updatePaymentStatus, updateTeam, uploadSiteHeroImage, type DashboardStats, type JuryMemberRecord, type NewTeamParticipant, type ParticipantRecord, type SiteSettings, type TeamRecord } from '../services/registrations'
import { supabase } from '../services/supabase'

const EMPTY_STATS: DashboardStats = { participants: 0, teams: 0, projects: 0, mentors: 0, jury: 0, sponsors: 0 }

function toCsvCell(value: unknown): string {
  const text = Array.isArray(value) ? value.join(' | ') : String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

export function Admin() {
  const navigate = useNavigate()
  const location = useLocation()
  const requestedSection = location.pathname.split('/')[2] || 'overview'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS)
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null)
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null)
  const [useDefaultHero, setUseDefaultHero] = useState(false)
  const [siteContentModalOpen, setSiteContentModalOpen] = useState(false)
  const [siteSettingsBusy, setSiteSettingsBusy] = useState(false)
  const [siteSettingsMessage, setSiteSettingsMessage] = useState('')
  const [siteSettingsError, setSiteSettingsError] = useState('')
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
  const [juryModalOpen, setJuryModalOpen] = useState(false)
  const [juryDeleteTarget, setJuryDeleteTarget] = useState<JuryMemberRecord | null>(null)
  const [newTeamOpen, setNewTeamOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamLeader, setNewTeamLeader] = useState<NewTeamParticipant>({
    first_name: '', last_name: '', email: '', phone: '', age: 18,
    school: '', company: '', position: '', payment_method: '', payment_reference: '',
    payment_commitment: false,
  })
  const [newTeamLeaderProfile, setNewTeamLeaderProfile] = useState<'student' | 'other'>('student')
  const [newTeamDelete, setNewTeamDelete] = useState<TeamRecord | null>(null)
  const [teamDeleteConfirmation, setTeamDeleteConfirmation] = useState('')
  const [teamProjectDraft, setTeamProjectDraft] = useState({ project_name: '', description: '' })
  const [editingProjectTeam, setEditingProjectTeam] = useState<TeamRecord | null>(null)
  const [newMemberTeam, setNewMemberTeam] = useState<TeamRecord | null>(null)
  const [newMemberProfile, setNewMemberProfile] = useState<'student' | 'other'>('student')
  const [newMemberDraft, setNewMemberDraft] = useState<NewTeamParticipant>({
    first_name: '', last_name: '', email: '', phone: '', age: 18,
    school: '', company: '', position: '', payment_method: '', payment_reference: '',
    payment_commitment: false,
  })
  const [newMemberPaymentCommitment, setNewMemberPaymentCommitment] = useState(false)
  const [memberRemoval, setMemberRemoval] = useState<{ team: TeamRecord; member: TeamRecord['members'][number] } | null>(null)
  const [paymentValidationTarget, setPaymentValidationTarget] = useState<ParticipantRecord | null>(null)

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
      try {
        const savedSettings = await getSiteSettings()
        setSiteSettings(savedSettings)
        setHeroImagePreview(savedSettings.hero_image_url)
        setSiteSettingsError('')
      } catch (error) {
        setSiteSettingsError(error instanceof Error ? error.message : 'Unable to load site content settings.')
      }
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

  useEffect(() => {
    const validSections = ['overview', 'site-content', 'jury', 'teams', 'participants']
    if (authenticated && !validSections.includes(requestedSection)) {
      navigate('/admin/overview', { replace: true })
    }
  }, [authenticated, navigate, requestedSection])

  useEffect(() => () => {
    if (heroImagePreview?.startsWith('blob:')) URL.revokeObjectURL(heroImagePreview)
  }, [heroImagePreview])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return records
    return records.filter((record) =>
      [record.first_name, record.last_name, record.email, record.school]
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

  const saveSiteContent = async (event: FormEvent) => {
    event.preventDefault()
    setSiteSettingsBusy(true)
    setSiteSettingsError('')
    setSiteSettingsMessage('')
    try {
      const heroImageUrl = heroImageFile
        ? await uploadSiteHeroImage(heroImageFile)
        : useDefaultHero
          ? null
          : siteSettings.hero_image_url
      const saved = await saveSiteSettings({
        contact_email: siteSettings.contact_email.trim(),
        contact_phone: siteSettings.contact_phone.trim(),
        linkedin_url: siteSettings.linkedin_url.trim(),
        instagram_url: siteSettings.instagram_url.trim(),
        hero_image_url: heroImageUrl,
      })
      setSiteSettings(saved)
      setHeroImageFile(null)
      setHeroImagePreview(saved.hero_image_url)
      setUseDefaultHero(false)
      setSiteSettingsMessage('Site content saved successfully.')
    } catch (error) {
      setSiteSettingsError(error instanceof Error ? error.message : 'Unable to save site content.')
    } finally {
      setSiteSettingsBusy(false)
    }
  }

  const selectHeroImage = (file?: File) => {
    if (!file) return
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (!supportedTypes.includes(file.type)) {
      setSiteSettingsError('Choose a JPG, PNG, WebP or AVIF image.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setSiteSettingsError('Image must be 8 MB or smaller.')
      return
    }
    setSiteSettingsError('')
    setSiteSettingsMessage('')
    setUseDefaultHero(false)
    setHeroImageFile(file)
    setHeroImagePreview(URL.createObjectURL(file))
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
      setJuryModalOpen(false)
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to save jury member.')
    } finally {
      setLoading(false)
    }
  }

  const confirmPaymentValidation = async () => {
    if (!paymentValidationTarget) return
    setDataError('')
    setLoading(true)
    try {
      const updated = await updatePaymentStatus(paymentValidationTarget.id, 'verified')
      setRecords((current) => current.map((record) => record.id === updated.id ? updated : record))
      setTeams((current) => current.map((team) => ({
        ...team,
        members: team.members.map((member) => member.participant_id === updated.id
          ? { ...member, payment_status: updated.payment_status }
          : member),
      })))
      setPaymentValidationTarget(null)
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to update payment status.')
    } finally {
      setLoading(false)
    }
  }

  const requestPaymentValidation = (participantId: string) => {
    const participant = records.find((record) => record.id === participantId)
    if (participant && participant.payment_status !== 'verified') setPaymentValidationTarget(participant)
  }

  const removeJury = async (member: JuryMemberRecord) => {
    setLoading(true)
    setDataError('')
    try {
      await deleteJuryMember(member.id)
      setJuryMembers((current) => current.filter((item) => item.id !== member.id))
      setJuryDeleteTarget(null)
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to delete jury member.')
    } finally {
      setLoading(false)
    }
  }

  const submitNewTeam = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setDataError('')
    try {
      await createTeamWithLeader(newTeamName.trim(), {
        ...newTeamLeader,
        first_name: newTeamLeader.first_name.trim(),
        last_name: newTeamLeader.last_name.trim(),
        email: newTeamLeader.email.trim().toLowerCase(),
        phone: newTeamLeader.phone.trim(),
        school: newTeamLeaderProfile === 'student' ? newTeamLeader.school.trim() : '',
        company: newTeamLeaderProfile === 'other' ? newTeamLeader.company.trim() : '',
        position: newTeamLeader.position.trim(),
        payment_reference: newTeamLeader.payment_reference.trim(),
      })
      setNewTeamOpen(false)
      setNewTeamName('')
      setNewTeamLeader({ first_name: '', last_name: '', email: '', phone: '', age: 18, school: '', company: '', position: '', payment_method: '', payment_reference: '', payment_commitment: false })
      setNewTeamLeaderProfile('student')
      await loadDashboard()
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to create team.')
    } finally {
      setLoading(false)
    }
  }

  const confirmDeleteTeam = async () => {
    if (!newTeamDelete || teamDeleteConfirmation !== newTeamDelete.team_name) return
    setLoading(true)
    setDataError('')
    try {
      await deleteTeam(newTeamDelete.id, teamDeleteConfirmation)
      setNewTeamDelete(null)
      setTeamDeleteConfirmation('')
      await loadDashboard()
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to permanently delete team.')
    } finally {
      setLoading(false)
    }
  }

  const openTeamDelete = (team: TeamRecord) => {
    setNewTeamDelete(team)
    setTeamDeleteConfirmation('')
    setDataError('')
  }

  const createTeamMember = async (event: FormEvent) => {
    event.preventDefault()
    if (!newMemberTeam) return
    setLoading(true)
    setDataError('')
    try {
      await createParticipantForTeam(newMemberTeam.id, {
        ...newMemberDraft,
        first_name: newMemberDraft.first_name.trim(),
        last_name: newMemberDraft.last_name.trim(),
        email: newMemberDraft.email.trim().toLowerCase(),
        phone: newMemberDraft.phone.trim(),
        school: newMemberProfile === 'student' ? newMemberDraft.school.trim() : '',
        company: newMemberProfile === 'other' ? newMemberDraft.company.trim() : '',
        position: newMemberDraft.position.trim(),
        payment_reference: newMemberDraft.payment_reference.trim(),
        payment_commitment: newMemberPaymentCommitment,
      })
      setNewMemberTeam(null)
      setNewMemberProfile('student')
      setNewMemberPaymentCommitment(false)
      setNewMemberDraft({ first_name: '', last_name: '', email: '', phone: '', age: 18, school: '', company: '', position: '', payment_method: '', payment_reference: '', payment_commitment: false })
      await loadDashboard()
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to create participant for this team.')
    } finally {
      setLoading(false)
    }
  }

  const openNewMemberForm = (team: TeamRecord) => {
    setNewMemberTeam(team)
    setDataError('')
  }

  const requestMemberRemoval = (team: TeamRecord, member: TeamRecord['members'][number]) => {
    if (member.is_leader && team.members.length > 1) {
      setDataError('Assign another team leader before removing this participant.')
      return
    }
    setDataError('')
    setMemberRemoval({ team, member })
  }

  const finishMemberRemoval = async (permanently: boolean) => {
    if (!memberRemoval) return
    const { team, member } = memberRemoval
    setLoading(true)
    setDataError('')
    try {
      if (permanently) {
        await deleteParticipantRecord(member.participant_id)
      } else {
        await removeParticipantFromTeam(team.id, member.participant_id)
      }
      setMemberRemoval(null)
      await loadDashboard()
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to remove participant.')
    } finally {
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

  const openProjectEditor = (team: TeamRecord) => {
    const isPlaceholder = team.project?.project_name.trim() === team.team_name.trim()
      && !team.project.description?.trim()
    setTeamProjectDraft({
      project_name: team.project && !isPlaceholder ? team.project.project_name : '',
      description: team.project && !isPlaceholder ? team.project.description || '' : '',
    })
    setEditingProjectTeam(team)
  }

  const saveProject = async (event: FormEvent) => {
    event.preventDefault()
    if (!editingProjectTeam) return
    setLoading(true)
    setDataError('')
    try {
      const saved = await saveTeamProject(
        editingProjectTeam.id,
        editingProjectTeam.project?.id ?? null,
        editingProjectTeam.members.find((member) => member.is_leader)?.participant_id ?? null,
        { project_name: teamProjectDraft.project_name.trim(), description: teamProjectDraft.description.trim() },
      )
      setTeams((current) => current.map((team) => team.id === editingProjectTeam.id ? { ...team, project: saved } : team))
      setEditingProjectTeam(null)
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
      ['email', 'Email'], ['phone', 'Phone'], ['age', 'Age'], ['school', 'School'], ['company', 'Company'],
      ['position', 'Position'], ['has_team', 'Has team'], ['looking_for_teammates', 'Looking for teammates'],
      ['payment_status', 'Payment status'], ['payment_method', 'Payment method'], ['payment_reference', 'Payment reference'],
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
    ['Participants', stats.participants, 'Registered builders'],
    ['Paid', records.filter((record) => record.payment_status === 'verified').length, 'Payment verified'],
    ['To validate', records.filter((record) => record.payment_status !== 'verified').length, 'Awaiting payment approval'],
    ['Teams', stats.teams, 'Teams in the Tank'],
    ['Projects', stats.projects, 'Ventures submitted'], ['Mentors', stats.mentors, 'Mentors available'],
    ['Jury', stats.jury, 'Sharks on the panel'], ['Sponsors', stats.sponsors, 'Supporting partners'],
  ]

  const adminSections = [
    { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
    { id: 'site-content', label: 'Site content', Icon: Image },
    { id: 'jury', label: 'Jury', Icon: Gavel },
    { id: 'teams', label: 'Teams', Icon: UsersRound },
    { id: 'participants', label: 'Participants', Icon: UserRound },
  ]
  const currentSection = adminSections.find((section) => section.id === requestedSection) ?? adminSections[0]

  return (
    <div className={`admin-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <header className="admin-nav">
        <button className="admin-sidebar-toggle" type="button" aria-label={mobileSidebarOpen ? 'Close admin sidebar' : sidebarCollapsed ? 'Expand admin sidebar' : 'Collapse admin sidebar'} onClick={() => {
          if (window.matchMedia('(max-width: 900px)').matches) setMobileSidebarOpen((open) => !open)
          else setSidebarCollapsed((collapsed) => !collapsed)
        }}>
          {mobileSidebarOpen ? <X size={19} /> : window.matchMedia('(max-width: 900px)').matches ? <Menu size={19} /> : sidebarCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
        </button>
        <Brand />
        <span className="form-count">ADMIN / {currentSection.label.toUpperCase()}</span>
        <div className="admin-actions">
          <button onClick={() => void loadDashboard()} className="admin-btn" disabled={loading}><RefreshCw size={15} /> Refresh</button>
          <button onClick={exportCsv} className="admin-btn primary-btn" disabled={!records.length}><Download size={15} /> Export CSV</button>
          <button onClick={() => void logout()} className="admin-btn"><LogOut size={15} /> Logout</button>
        </div>
      </header>

      <div className={`admin-body ${mobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
        {mobileSidebarOpen && <button className="admin-sidebar-backdrop" type="button" aria-label="Close admin navigation" onClick={() => setMobileSidebarOpen(false)} />}
        <aside className={`admin-sidebar ${sidebarCollapsed ? 'is-collapsed' : ''} ${mobileSidebarOpen ? 'is-mobile-open' : ''}`} aria-label="Dashboard sections">
          <div className="admin-sidebar-label">WORKSPACE</div>
          <nav>
            {adminSections.map(({ id, label, Icon }) => (
              <button key={id} type="button" title={sidebarCollapsed ? label : undefined} className={requestedSection === id ? 'active' : ''} aria-current={requestedSection === id ? 'page' : undefined} onClick={() => { navigate(`/admin/${id}`); setMobileSidebarOpen(false) }}>
                <Icon size={17} /><span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="admin-main-content">
        <div className="admin-head">
          <div>
            <div className="section-label">/ EVENT CONTROL ROOM</div>
            <h1>{requestedSection === 'overview' ? <>Hack Tank <span>dashboard.</span></> : <>{currentSection.label}<span>.</span></>}</h1>
          </div>
          <div className="admin-status"><Users size={16} /> {loading ? 'Syncing data...' : 'Live Supabase data'}</div>
        </div>

        {dataError && <p className="admin-alert" role="alert">{dataError}</p>}

        {requestedSection === 'overview' && <section className="admin-stats">
          {cards.map(([label, value, detail]) => (
            <div className="admin-stat-card" key={String(label)}>
              <span>{label}</span><strong>{value}</strong><small>{detail}</small>
            </div>
          ))}
        </section>}

        {requestedSection === 'site-content' && <section className="admin-section admin-site-content">
          <div className="admin-section-head">
            <div><h2>Site content</h2><p>Manage the public footer contacts and the home page image.</p><button className="admin-btn primary-btn admin-add-team" type="button" onClick={() => setSiteContentModalOpen(true)}><Pencil size={15} /> Edit site content</button></div>
          </div>
          {siteSettingsError && <p className="admin-alert" role="alert">{siteSettingsError}</p>}
          {siteSettingsMessage && <p className="admin-settings-success" role="status">{siteSettingsMessage}</p>}
        </section>}

        {requestedSection === 'site-content' && siteContentModalOpen && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !siteSettingsBusy) setSiteContentModalOpen(false) }}>
          <section className="admin-participant-modal admin-site-modal" role="dialog" aria-modal="true" aria-labelledby="site-content-title">
            <div className="admin-modal-head"><div><div className="section-label">/ SITE CONTENT</div><h2 id="site-content-title">Edit site content</h2><p>Update the public footer contacts and home image.</p></div><button className="admin-icon-btn" type="button" title="Close" disabled={siteSettingsBusy} onClick={() => setSiteContentModalOpen(false)}><X size={18} /></button></div>
            <form className="admin-site-form" onSubmit={saveSiteContent}>
            <div className="admin-site-fields">
              <label>Contact email<input type="email" value={siteSettings.contact_email} onChange={(event) => setSiteSettings({ ...siteSettings, contact_email: event.target.value })} required /></label>
              <label>Phone number<input type="tel" value={siteSettings.contact_phone} onChange={(event) => setSiteSettings({ ...siteSettings, contact_phone: event.target.value })} required /></label>
              <label>LinkedIn URL<input type="url" value={siteSettings.linkedin_url} onChange={(event) => setSiteSettings({ ...siteSettings, linkedin_url: event.target.value })} placeholder="https://linkedin.com/..." /></label>
              <label>Instagram URL<input type="url" value={siteSettings.instagram_url} onChange={(event) => setSiteSettings({ ...siteSettings, instagram_url: event.target.value })} placeholder="https://instagram.com/..." /></label>
            </div>
            <div className="admin-site-image-row">
              <div className="admin-site-image-preview">
                {heroImagePreview && !useDefaultHero
                  ? <img src={heroImagePreview} alt="Home page image preview" />
                  : <span>Current bundled home image</span>}
              </div>
              <div className="admin-site-image-controls">
                <label>Home page image<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => selectHeroImage(event.currentTarget.files?.[0])} /></label>
                <small>JPG, PNG, WebP or AVIF, maximum 8 MB.</small>
                {(siteSettings.hero_image_url || heroImageFile) && <button className="admin-text-btn danger-text" type="button" onClick={() => { setHeroImageFile(null); setHeroImagePreview(null); setUseDefaultHero(true); setSiteSettingsMessage('') }}>Use default image</button>}
              </div>
            </div>
            {siteSettingsError && <p className="admin-alert" role="alert">{siteSettingsError}</p>}
            {siteSettingsMessage && <p className="admin-settings-success" role="status">{siteSettingsMessage}</p>}
              <div className="admin-modal-actions"><button className="admin-btn" type="button" disabled={siteSettingsBusy} onClick={() => setSiteContentModalOpen(false)}>Cancel</button><button className="admin-btn primary-btn" type="submit" disabled={siteSettingsBusy}><Save size={15} />{siteSettingsBusy ? 'Saving...' : 'Save site content'}</button></div>
            </form>
          </section>
        </div>}

        {requestedSection === 'jury' && <section className="admin-section" id="admin-jury">
          <div className="admin-section-head">
            <div><h2>Jury management</h2><p>Create, edit or remove jury profiles. Account passwords remain managed by Supabase Auth.</p><button className="admin-btn primary-btn admin-add-team" type="button" onClick={() => { setEditingJuryId(null); setJuryDraft({ full_name: '', company: '', position: '' }); setJuryModalOpen(true) }}><Plus size={15} /> Add jury</button></div>
            <input className="admin-search" placeholder="Search jury..." value={juryQuery} onChange={(event) => setJuryQuery(event.target.value)} />
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Company</th><th>Position</th><th>Account</th><th>Actions</th></tr></thead>
              <tbody>{filteredJury.map((member) => (
                <tr key={member.id}>
                  <td>{member.full_name}</td><td>{member.company || '—'}</td><td>{member.position || '—'}</td><td>{member.user_id ? 'Linked' : 'No account'}</td>
                  <td className="admin-row-actions"><button className="admin-icon-btn" type="button" title="Edit jury" onClick={() => { setEditingJuryId(member.id); setJuryDraft({ full_name: member.full_name, company: member.company || '', position: member.position || '' }); setJuryModalOpen(true) }}><Pencil size={15} /></button><button className="admin-icon-btn danger" type="button" title="Delete jury" onClick={() => setJuryDeleteTarget(member)}><Trash2 size={15} /></button></td>
                </tr>
              ))}</tbody>
            </table>
            {!filteredJury.length && <p className="admin-note">No jury members found.</p>}
          </div>
        </section>}

        {requestedSection === 'teams' && <section className="admin-section" id="admin-teams">
          <div className="admin-section-head">
            <div><h2>Teams</h2><p>Manage teams, their members, and one project per team.</p><button className="admin-btn primary-btn admin-add-team" type="button" onClick={() => setNewTeamOpen(true)}><Plus size={15} /> Add team</button></div>
            <input className="admin-search" placeholder="Search team, member or project..." value={teamQuery} onChange={(event) => setTeamQuery(event.target.value)} />
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Team</th><th>Members</th><th>Project</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>{filteredTeams.map((team) => (
                <tr key={team.id}>
                  <td><strong>{team.team_name}</strong>{team.slogan && <small className="admin-cell-subtitle">{team.slogan}</small>}</td>
                  <td><div className="admin-member-list">{team.members.length ? team.members.map((member) => <span className="admin-member-item" key={member.participant_id}><span><span className={member.payment_status === 'verified' ? '' : 'admin-unpaid-name'}>{member.name}{member.is_leader ? ' (leader)' : ''}</span><small>{member.email}</small><small className={member.payment_status === 'verified' ? 'admin-payment-paid' : 'admin-payment-unpaid'}>{member.payment_status === 'verified' ? 'Paid' : 'Payment to validate'}</small>{member.payment_status !== 'verified' && <button className="admin-text-btn" type="button" onClick={() => requestPaymentValidation(member.participant_id)}>Validate payment</button>}{!member.is_leader && <button className="admin-text-btn" onClick={() => void changeLeader(team, member.participant_id)}>Make leader</button>}</span><button className="admin-icon-btn danger admin-member-remove" type="button" title={`Remove ${member.name}`} aria-label={`Remove ${member.name}`} onClick={() => requestMemberRemoval(team, member)}><Trash2 size={13} /></button></span>) : 'No members'}</div><button className="admin-new-member-btn" type="button" onClick={() => openNewMemberForm(team)}><UserPlus size={14} /> New participant</button></td>
                  <td><strong>{team.project?.project_name.trim() === team.team_name.trim() && !team.project.description?.trim() ? 'Not filled yet' : team.project?.project_name || 'Not filled yet'}</strong>{team.project?.description && <small className="admin-cell-subtitle">{team.project.description}</small>}<button className="admin-text-btn" type="button" onClick={() => openProjectEditor(team)}>{team.project?.description || (team.project && team.project.project_name !== team.team_name) ? 'Edit project' : 'Fill project'}</button></td>
                  <td>{new Date(team.created_at).toLocaleDateString()}</td>
                  <td className="admin-row-actions"><button className="admin-icon-btn danger" type="button" title={`Delete team ${team.team_name}`} aria-label={`Delete team ${team.team_name}`} onClick={() => openTeamDelete(team)}><Trash2 size={15} /></button></td>
                </tr>
              ))}</tbody>
            </table>
            {!filteredTeams.length && <p className="admin-note">No teams found.</p>}
          </div>
        </section>}

        {requestedSection === 'participants' && <section className="admin-section" id="admin-participants">
          <div className="admin-section-head">
            <div><h2>Participants</h2><p>All applications submitted through the public registration form.</p></div>
            <input className="admin-search" placeholder="Search name, email, school, skill..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>School</th><th>Team</th><th>Payment</th><th>Submitted</th></tr></thead>
              <tbody>
                {filtered.map((record, index) => (
                  <tr key={record.id}>
                    <td>{index + 1}</td><td className={record.payment_status === 'verified' ? '' : 'admin-unpaid-name'}>{record.first_name} {record.last_name}</td><td>{record.email}</td>
                    <td>{record.school || '—'}</td>
                    <td>{record.has_team ? 'Yes' : '—'}</td>
                    <td>
                      <strong className={record.payment_status === 'verified' ? 'admin-payment-paid' : 'admin-payment-unpaid'}>{record.payment_status === 'verified' ? 'Paid' : record.payment_status === 'rejected' ? 'Rejected' : 'To validate'}</strong>
                      <small className="admin-cell-subtitle">{record.payment_method || '—'}{record.payment_reference ? ` · ${record.payment_reference}` : ''}</small>
                      <div className="admin-row-actions">
                        {record.payment_status !== 'verified' && <button className="admin-text-btn" type="button" onClick={() => setPaymentValidationTarget(record)}>Validate payment</button>}
                      </div>
                    </td>
                    <td>{new Date(record.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && !filtered.length && <p className="admin-note">No participants found.</p>}
          </div>
        </section>}
        </main>
      </div>
      {paymentValidationTarget && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) setPaymentValidationTarget(null) }}>
        <section className="admin-participant-modal admin-delete-choice" role="dialog" aria-modal="true" aria-labelledby="payment-validation-title">
          <div className="admin-modal-head"><div><div className="section-label">/ PAYMENT</div><h2 id="payment-validation-title">Confirm payment?</h2><p>Mark the payment for <strong>{paymentValidationTarget.first_name} {paymentValidationTarget.last_name}</strong> as verified?</p><small className="admin-cell-subtitle">{paymentValidationTarget.payment_method || 'Payment method not specified'}{paymentValidationTarget.payment_reference ? ` · ${paymentValidationTarget.payment_reference}` : ''}</small></div><button className="admin-icon-btn" type="button" title="Close" disabled={loading} onClick={() => setPaymentValidationTarget(null)}><X size={18} /></button></div>
          <div className="admin-modal-actions"><button className="admin-btn" type="button" disabled={loading} onClick={() => setPaymentValidationTarget(null)}>Cancel</button><button className="admin-btn primary-btn" type="button" disabled={loading} onClick={() => void confirmPaymentValidation()}><Save size={15} />{loading ? 'Validating...' : 'Confirm payment'}</button></div>
        </section>
      </div>}
      {juryModalOpen && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) setJuryModalOpen(false) }}>
        <form className="admin-participant-modal" onSubmit={saveJury}>
          <div className="admin-modal-head"><div><div className="section-label">/ JURY PROFILE</div><h2>{editingJuryId ? 'Edit jury member' : 'New jury member'}</h2><p>Enter the public profile details. Account access is managed separately.</p></div><button className="admin-icon-btn" type="button" title="Close" disabled={loading} onClick={() => setJuryModalOpen(false)}><X size={18} /></button></div>
          <div className="admin-participant-grid">
            <label>Full name *<input value={juryDraft.full_name} onChange={(event) => setJuryDraft({ ...juryDraft, full_name: event.target.value })} autoComplete="name" required /></label>
            <label>Company<input value={juryDraft.company} onChange={(event) => setJuryDraft({ ...juryDraft, company: event.target.value })} /></label>
            <label>Position<input value={juryDraft.position} onChange={(event) => setJuryDraft({ ...juryDraft, position: event.target.value })} /></label>
          </div>
          <div className="admin-modal-actions"><button className="admin-btn" type="button" disabled={loading} onClick={() => setJuryModalOpen(false)}>Cancel</button><button className="admin-btn primary-btn" type="submit" disabled={loading}><Save size={15} />{loading ? 'Saving...' : editingJuryId ? 'Save changes' : 'Create jury member'}</button></div>
        </form>
      </div>}
      {juryDeleteTarget && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) setJuryDeleteTarget(null) }}>
        <section className="admin-participant-modal admin-delete-choice" role="dialog" aria-modal="true" aria-labelledby="jury-delete-title">
          <div className="admin-modal-head"><div><div className="section-label">/ DELETE JURY PROFILE</div><h2 id="jury-delete-title">Delete jury member?</h2><p>Delete <strong>{juryDeleteTarget.full_name}</strong>? Existing scores associated with this jury member will also be deleted.</p></div><button className="admin-icon-btn" type="button" title="Close" disabled={loading} onClick={() => setJuryDeleteTarget(null)}><X size={18} /></button></div>
          <div className="admin-modal-actions"><button className="admin-btn" type="button" disabled={loading} onClick={() => setJuryDeleteTarget(null)}>Cancel</button><button className="admin-btn danger" type="button" disabled={loading} onClick={() => void removeJury(juryDeleteTarget)}><Trash2 size={15} />{loading ? 'Deleting...' : 'Delete jury member'}</button></div>
        </section>
      </div>}
      {newTeamOpen && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) setNewTeamOpen(false) }}>
        <form className="admin-participant-modal" onSubmit={submitNewTeam}>
          <div className="admin-modal-head"><div><div className="section-label">/ NEW TEAM</div><h2>Create a team</h2><p>Enter the team and leader details. You can add more participants afterward.</p></div><button className="admin-icon-btn" type="button" title="Close" disabled={loading} onClick={() => setNewTeamOpen(false)}><X size={18} /></button></div>
          <div className="admin-participant-grid">
            <label>Team name *<input value={newTeamName} onChange={(event) => setNewTeamName(event.target.value)} required /></label>
            <label>Leader first name *<input value={newTeamLeader.first_name} onChange={(event) => setNewTeamLeader({ ...newTeamLeader, first_name: event.target.value })} required /></label>
            <label>Leader last name *<input value={newTeamLeader.last_name} onChange={(event) => setNewTeamLeader({ ...newTeamLeader, last_name: event.target.value })} required /></label>
            <label>Email address *<input type="email" value={newTeamLeader.email} onChange={(event) => setNewTeamLeader({ ...newTeamLeader, email: event.target.value })} required /></label>
            <label>Phone number *<input value={newTeamLeader.phone} onChange={(event) => setNewTeamLeader({ ...newTeamLeader, phone: event.target.value })} required /></label>
            <label>Age *<input type="number" min="15" max="99" value={newTeamLeader.age} onChange={(event) => setNewTeamLeader({ ...newTeamLeader, age: Number(event.target.value) })} required /></label>
          </div>
          <div className="admin-profile-switch" role="group" aria-label="Leader profile">
            <button type="button" aria-pressed={newTeamLeaderProfile === 'student'} className={newTeamLeaderProfile === 'student' ? 'selected' : ''} onClick={() => setNewTeamLeaderProfile('student')}>Student</button>
            <button type="button" aria-pressed={newTeamLeaderProfile === 'other'} className={newTeamLeaderProfile === 'other' ? 'selected' : ''} onClick={() => setNewTeamLeaderProfile('other')}>Professional / Other</button>
          </div>
          <div className="admin-participant-grid">
            {newTeamLeaderProfile === 'student'
              ? <label>School or university *<input value={newTeamLeader.school} onChange={(event) => setNewTeamLeader({ ...newTeamLeader, school: event.target.value })} required /></label>
              : <label>Current company *<input value={newTeamLeader.company} onChange={(event) => setNewTeamLeader({ ...newTeamLeader, company: event.target.value })} required /></label>}
            <label>Current role *<input value={newTeamLeader.position} onChange={(event) => setNewTeamLeader({ ...newTeamLeader, position: event.target.value })} required /></label>
            <label>Payment method *<select value={newTeamLeader.payment_method} onChange={(event) => setNewTeamLeader({ ...newTeamLeader, payment_method: event.target.value })} required><option value="" disabled>Select a method</option><option value="Bank transfer">Bank transfer</option><option value="Organizer payment">Payment to an organizer</option></select></label>
            <label>Payment reference *<input value={newTeamLeader.payment_reference} onChange={(event) => setNewTeamLeader({ ...newTeamLeader, payment_reference: event.target.value })} required /></label>
          </div>
          <label className="admin-payment-commitment"><input type="checkbox" checked={newTeamLeader.payment_commitment} onChange={(event) => setNewTeamLeader({ ...newTeamLeader, payment_commitment: event.target.checked })} required /><span>Leader confirms they will pay the participation fee before the deadline.</span></label>
          <div className="admin-modal-actions"><button className="admin-btn" type="button" disabled={loading} onClick={() => setNewTeamOpen(false)}>Cancel</button><button className="admin-btn primary-btn" type="submit" disabled={loading}><UserPlus size={15} />{loading ? 'Creating...' : 'Create team'}</button></div>
        </form>
      </div>}
      {newTeamDelete && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) setNewTeamDelete(null) }}>
        <section className="admin-participant-modal admin-delete-choice" role="dialog" aria-modal="true" aria-labelledby="team-delete-title">
          <div className="admin-modal-head"><div><div className="section-label">/ PERMANENT DELETION</div><h2 id="team-delete-title">Delete this team?</h2><p>This permanently deletes <strong>{newTeamDelete.team_name}</strong>, every participant record in the team, and its project data.</p></div><button className="admin-icon-btn" type="button" title="Close" disabled={loading} onClick={() => setNewTeamDelete(null)}><X size={18} /></button></div>
          <label className="admin-team-delete-confirm">Type <strong>{newTeamDelete.team_name}</strong> to confirm<input value={teamDeleteConfirmation} onChange={(event) => setTeamDeleteConfirmation(event.target.value)} autoComplete="off" /></label>
          <div className="admin-modal-actions"><button className="admin-btn" type="button" disabled={loading} onClick={() => setNewTeamDelete(null)}>Cancel</button><button className="admin-btn danger" type="button" disabled={loading || teamDeleteConfirmation !== newTeamDelete.team_name} onClick={() => void confirmDeleteTeam()}><Trash2 size={15} />{loading ? 'Deleting...' : 'Delete team and members'}</button></div>
        </section>
      </div>}
      {editingProjectTeam && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) setEditingProjectTeam(null) }}>
        <form className="admin-participant-modal" onSubmit={saveProject}>
          <div className="admin-modal-head"><div><div className="section-label">/ TEAM PROJECT</div><h2>Project details</h2><p>One project for <strong>{editingProjectTeam.team_name}</strong>.</p></div><button className="admin-icon-btn" type="button" title="Close" disabled={loading} onClick={() => setEditingProjectTeam(null)}><X size={18} /></button></div>
          <div className="admin-project-editor-fields">
            <label>Project name *<input value={teamProjectDraft.project_name} onChange={(event) => setTeamProjectDraft({ ...teamProjectDraft, project_name: event.target.value })} placeholder="Enter the project name" required /></label>
            <label>Description *<textarea value={teamProjectDraft.description} onChange={(event) => setTeamProjectDraft({ ...teamProjectDraft, description: event.target.value })} placeholder="Describe the team's idea" required /></label>
          </div>
          <div className="admin-modal-actions"><button className="admin-btn" type="button" disabled={loading} onClick={() => setEditingProjectTeam(null)}>Cancel</button><button className="admin-btn primary-btn" type="submit" disabled={loading}><Save size={15} />{loading ? 'Saving...' : 'Save project'}</button></div>
        </form>
      </div>}
      {memberRemoval && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) setMemberRemoval(null) }}>
        <section className="admin-participant-modal admin-delete-choice" role="dialog" aria-modal="true" aria-labelledby="member-removal-title">
          <div className="admin-modal-head"><div><div className="section-label">/ REMOVE MEMBER</div><h2 id="member-removal-title">What would you like to do?</h2><p><strong>{memberRemoval.member.name}</strong> · {memberRemoval.team.team_name}</p></div><button className="admin-icon-btn" type="button" title="Close" disabled={loading} onClick={() => setMemberRemoval(null)}><X size={18} /></button></div>
          <div className="admin-removal-options">
            <button className="admin-removal-option" type="button" disabled={loading} onClick={() => void finishMemberRemoval(false)}><span><b>Remove from this team</b><small>Keep their participant record in the dashboard.</small></span><UserPlus size={17} /></button>
            <button className="admin-removal-option permanent" type="button" disabled={loading} onClick={() => void finishMemberRemoval(true)}><span><b>{loading ? 'Deleting...' : 'Delete participant permanently'}</b><small>Delete their participant record and remove them from all teams. Any Supabase Auth account is kept.</small></span><Trash2 size={17} /></button>
          </div>
          <div className="admin-modal-actions"><button className="admin-btn" type="button" disabled={loading} onClick={() => setMemberRemoval(null)}>Cancel</button></div>
        </section>
      </div>}
      {newMemberTeam && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setNewMemberTeam(null) }}>
        <form className="admin-participant-modal" onSubmit={createTeamMember}>
          <div className="admin-modal-head"><div><div className="section-label">/ TEAM MEMBER</div><h2>New participant</h2><p>Register a new person for <strong>{newMemberTeam.team_name}</strong>.</p></div><button className="admin-icon-btn" type="button" title="Close" onClick={() => setNewMemberTeam(null)}><X size={18} /></button></div>
          <div className="admin-participant-grid">
            <label>First name *<input value={newMemberDraft.first_name} onChange={(event) => setNewMemberDraft({ ...newMemberDraft, first_name: event.target.value })} autoComplete="given-name" required /></label>
            <label>Last name *<input value={newMemberDraft.last_name} onChange={(event) => setNewMemberDraft({ ...newMemberDraft, last_name: event.target.value })} autoComplete="family-name" required /></label>
            <label>Email address *<input type="email" value={newMemberDraft.email} onChange={(event) => setNewMemberDraft({ ...newMemberDraft, email: event.target.value })} autoComplete="email" required /></label>
            <label>Phone number *<input value={newMemberDraft.phone} onChange={(event) => setNewMemberDraft({ ...newMemberDraft, phone: event.target.value })} autoComplete="tel" required /></label>
            <label>Age *<input type="number" min="15" max="99" value={newMemberDraft.age} onChange={(event) => setNewMemberDraft({ ...newMemberDraft, age: Number(event.target.value) })} required /></label>
          </div>
          <div className="admin-profile-switch" role="group" aria-label="Participant profile">
            <button type="button" aria-pressed={newMemberProfile === 'student'} className={newMemberProfile === 'student' ? 'selected' : ''} onClick={() => setNewMemberProfile('student')}>Student</button>
            <button type="button" aria-pressed={newMemberProfile === 'other'} className={newMemberProfile === 'other' ? 'selected' : ''} onClick={() => setNewMemberProfile('other')}>Professional / Other</button>
          </div>
          <div className="admin-participant-grid">
            {newMemberProfile === 'student'
              ? <label>School or university *<input value={newMemberDraft.school} onChange={(event) => setNewMemberDraft({ ...newMemberDraft, school: event.target.value })} required /></label>
              : <label>Current company *<input value={newMemberDraft.company} onChange={(event) => setNewMemberDraft({ ...newMemberDraft, company: event.target.value })} required /></label>}
            <label>Current role *<input value={newMemberDraft.position} onChange={(event) => setNewMemberDraft({ ...newMemberDraft, position: event.target.value })} required /></label>
            <label>Payment method *<select value={newMemberDraft.payment_method} onChange={(event) => setNewMemberDraft({ ...newMemberDraft, payment_method: event.target.value })} required><option value="" disabled>Select a method</option><option value="Bank transfer">Bank transfer</option><option value="Organizer payment">Payment to an organizer</option></select></label>
            <label>Payment reference *<input value={newMemberDraft.payment_reference} onChange={(event) => setNewMemberDraft({ ...newMemberDraft, payment_reference: event.target.value })} required /></label>
          </div>
          <label className="admin-payment-commitment"><input type="checkbox" checked={newMemberPaymentCommitment} onChange={(event) => setNewMemberPaymentCommitment(event.target.checked)} required /><span>Participant confirms they will pay the participation fee before the deadline.</span></label>
          <div className="admin-modal-actions"><button className="admin-btn" type="button" onClick={() => setNewMemberTeam(null)}>Cancel</button><button className="admin-btn primary-btn" type="submit" disabled={loading}><UserPlus size={15} />{loading ? 'Adding...' : 'Add to team'}</button></div>
        </form>
      </div>}
    </div>
  )
}

function AdminNotice({ title, text }: { title: string; text: string }) {
  return <div className="admin-login"><div className="admin-login-card"><Brand /><div className="section-label">/ SETUP</div><h1>{title}</h1><p>{text}</p></div></div>
}
