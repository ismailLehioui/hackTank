import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, LogOut, Save } from 'lucide-react'
import { Brand } from '../components/Brand'
import { getJuryDashboard, saveScore, signIn, signOut, type Criterion, type Project, type Ranking } from '../services/dashboards'
import { isSupabaseConfigured, supabase } from '../services/supabase'

export function Jury() {
  const [authenticated, setAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [juryId, setJuryId] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [ranking, setRanking] = useState<Ranking[]>([])
  const [projectId, setProjectId] = useState('')
  const [criterionId, setCriterionId] = useState('')
  const [score, setScore] = useState(7)
  const [comment, setComment] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const data = await getJuryDashboard()
      setJuryId(data.jury.id); setProjects(data.projects); setCriteria(data.criteria); setRanking(data.ranking)
      setProjectId((current) => current || data.projects[0]?.id || '')
      setCriterionId((current) => current || data.criteria[0]?.id || '')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load jury dashboard.') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setAuthenticated(Boolean(data.session)))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setAuthenticated(Boolean(session)))
    return () => listener.subscription.unsubscribe()
  }, [])
  useEffect(() => { if (authenticated) void load() }, [authenticated])

  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError('')
    try { await signIn(email, password) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign in.') } finally { setLoading(false) }
  }
  const submitScore = async (event: React.FormEvent) => {
    event.preventDefault(); if (!projectId || !criterionId) return
    setLoading(true); setError('')
    try { await saveScore(projectId, juryId, criterionId, score, comment); setComment(''); await load() }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save score.') } finally { setLoading(false) }
  }

  if (!isSupabaseConfigured) return <AccessNotice title="Supabase setup required" text="Configure Supabase before opening the jury dashboard." />
  if (!authenticated) return <Login title="Jury login." email={email} password={password} error={error} loading={loading} setEmail={setEmail} setPassword={setPassword} login={login} />

  return <div className="admin-page">
    <header className="admin-nav"><Brand /><span className="form-count">JURY / SCORING ROOM</span><button className="admin-btn" onClick={() => void signOut()}><LogOut size={15} /> Logout</button></header>
    <div className="admin-body">
      <div className="admin-head"><div><div className="section-label">/ SHARK PANEL</div><h1>Score the <span>ventures.</span></h1></div><div className="admin-status"><Award size={16} /> {loading ? 'Syncing...' : `${projects.length} projects`}</div></div>
      {error && <p className="admin-alert" role="alert">{error}</p>}
      <div className="jury-layout">
        <form className="jury-score-card" onSubmit={submitScore}>
          <h2>Give a score</h2>
          <label>Project<select value={projectId} onChange={(event) => setProjectId(event.target.value)}>{projects.map((project) => <option value={project.id} key={project.id}>{project.project_name}</option>)}</select></label>
          <label>Criterion<select value={criterionId} onChange={(event) => setCriterionId(event.target.value)}>{criteria.map((criterion) => <option value={criterion.id} key={criterion.id}>{criterion.name} ({criterion.weight}%)</option>)}</select></label>
          <label>Score <strong>{score}/10</strong><input type="range" min="1" max="10" value={score} onChange={(event) => setScore(Number(event.target.value))} /></label>
          <label>Comment<textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Your feedback for this venture..." /></label>
          <button className="primary" disabled={loading || !projects.length || !criteria.length}><Save size={15} /> Save score</button>
        </form>
        <div className="jury-projects"><h2>Projects to review</h2>{projects.map((project) => <article key={project.id} className="jury-project"><span>{project.category || 'Open Innovation'}</span><h3>{project.project_name}</h3><p>{project.description || 'No project description yet.'}</p><button onClick={() => setProjectId(project.id)}>Score this project →</button></article>)}</div>
      </div>
      <section className="admin-section"><div className="admin-section-head"><div><h2>Live ranking</h2><p>Calculated automatically from all jury scores.</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Rank</th><th>Project</th><th>Track</th><th>Average score</th><th>Scores</th></tr></thead><tbody>{ranking.map((row, index) => <tr key={row.project_id}><td>#{index + 1}</td><td>{row.project_name}</td><td>{row.category || '—'}</td><td>{row.average_score ?? '—'} / 10</td><td>{row.total_scores}</td></tr>)}</tbody></table></div></section>
    </div>
  </div>
}

type LoginProps = { title: string; email: string; password: string; error: string; loading: boolean; setEmail: (value: string) => void; setPassword: (value: string) => void; login: (event: React.FormEvent) => void }
function Login({ title, email, password, error, loading, setEmail, setPassword, login }: LoginProps) { return <div className="admin-login"><form onSubmit={login} className="admin-login-card"><Brand /><div className="section-label">/ SECURE ACCESS</div><h1>{title}</h1><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" required /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" required />{error && <span className="field-error">{error}</span>}<button className="primary" disabled={loading}>Unlock <span>↗</span></button></form></div> }
function AccessNotice({ title, text }: { title: string; text: string }) { return <div className="admin-login"><div className="admin-login-card"><Brand /><h1>{title}</h1><p>{text}</p><Link className="primary" to="/">Back home</Link></div></div> }
