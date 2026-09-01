import { supabase } from './supabase'

type Project = { id: string; project_name: string; category: string | null; description: string | null; problem_statement: string | null; solution: string | null; github_url: string | null; demo_url: string | null; pitch_deck_url: string | null }
type Criterion = { id: string; name: string; weight: number }
type Jury = { id: string; full_name: string }
type Ranking = { project_id: string; project_name: string; category: string | null; average_score: number | null; total_scores: number }

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function signIn(email: string, password: string) {
  const { error } = await client().auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut() {
  await client().auth.signOut()
}

export async function getJuryDashboard() {
  const api = client()
  const { data: userData, error: userError } = await api.auth.getUser()
  if (userError || !userData.user) throw new Error('Please sign in again.')
  const [juryResult, projectsResult, criteriaResult, rankingResult] = await Promise.all([
    api.from('jury_members').select('id, full_name').eq('user_id', userData.user.id).single(),
    api.from('projects').select('id, project_name, category, description, problem_statement, solution, github_url, demo_url, pitch_deck_url').order('created_at'),
    api.from('evaluation_criteria').select('id, name, weight').order('name'),
    api.rpc('get_jury_ranking'),
  ])
  const error = juryResult.error || projectsResult.error || criteriaResult.error || rankingResult.error
  if (error) throw error
  return { jury: juryResult.data as Jury, projects: projectsResult.data as Project[], criteria: criteriaResult.data as Criterion[], ranking: rankingResult.data as Ranking[] }
}

export async function saveScore(projectId: string, juryMemberId: string, criterionId: string, score: number, comment: string) {
  const { error } = await client().from('project_scores').upsert({
    project_id: projectId,
    jury_member_id: juryMemberId,
    criteria_id: criterionId,
    score,
    comment,
  }, { onConflict: 'project_id,jury_member_id,criteria_id' })
  if (error) throw error
}

export async function getTeamProject() {
  const api = client()
  const { error: claimError } = await api.rpc('claim_my_participant')
  if (claimError) throw claimError
  const { data, error } = await api.from('projects').select('id, project_name, category, description, problem_statement, solution, github_url, demo_url, pitch_deck_url').limit(1).single()
  if (error) throw error
  return data as Project
}

export async function updateTeamProject(projectId: string, values: Partial<Project>) {
  const { error } = await client().from('projects').update(values).eq('id', projectId)
  if (error) throw error
}

export async function addTeamMember(projectId: string, email: string) {
  const { error } = await client().rpc('add_team_member', {
    p_project_id: projectId,
    p_email: email,
  })
  if (error) throw error
}

export async function uploadPitchDeck(projectId: string, file: File) {
  if (file.type !== 'application/pdf') throw new Error('Only PDF files are accepted.')
  if (file.size > 10 * 1024 * 1024) throw new Error('Pitch deck must be 10 MB or smaller.')
  const api = client()
  const { data: userData, error: userError } = await api.auth.getUser()
  if (userError || !userData.user) throw new Error('Please sign in again.')
  const path = `${userData.user.id}/${projectId}-${Date.now()}.pdf`
  const { error: uploadError } = await api.storage.from('pitch-decks').upload(path, file, { upsert: true, contentType: 'application/pdf' })
  if (uploadError) throw uploadError
  await updateTeamProject(projectId, { pitch_deck_url: path })
  return path
}

export type { Criterion, Project, Ranking }
