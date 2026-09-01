import type { RegistrationData } from '../types'
import { isSupabaseConfigured, supabase } from './supabase'

export type ParticipantRecord = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  age: number
  city: string
  country: string
  school: string | null
  company: string | null
  position: string | null
  experience_level: string | null
  skills: string[]
  has_team: boolean
  looking_for_teammates: boolean
  created_at: string
}

export type DashboardStats = {
  participants: number
  teams: number
  projects: number
  mentors: number
  jury: number
  sponsors: number
}

export async function submitRegistration(data: RegistrationData) {
  if (!supabase) throw new Error('Supabase is not configured')

  const { error } = await supabase.rpc('submit_registration', {
    p_first_name: data.firstName,
    p_last_name: data.lastName,
    p_email: data.email,
    p_phone: data.phone,
    p_age: Number(data.age),
    p_city: data.city,
    p_country: data.country,
    p_school: data.university,
    p_company: data.company,
    p_position: data.position,
    p_experience: data.experience,
    p_skills: data.skills,
    p_has_team: data.hasTeam === 'Yes, we’re a team',
    p_team_name: data.teamName,
    p_track: data.track,
    p_idea: data.idea,
    p_problem: data.problem,
    p_looking_for_teammates: data.lookingForTeammates,
  })

  if (error) throw error
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!supabase) throw new Error('Supabase is not configured')
  const client = supabase
  const tables = ['participants', 'teams', 'projects', 'mentors', 'jury_members', 'sponsors'] as const
  const results = await Promise.all(tables.map((table) => client.from(table).select('*', { count: 'exact', head: true })))
  const failure = results.find((result) => result.error)
  if (failure?.error) throw failure.error

  return {
    participants: results[0].count ?? 0,
    teams: results[1].count ?? 0,
    projects: results[2].count ?? 0,
    mentors: results[3].count ?? 0,
    jury: results[4].count ?? 0,
    sponsors: results[5].count ?? 0,
  }
}

export async function getParticipants(): Promise<ParticipantRecord[]> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.from('participants').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as ParticipantRecord[]
}

export async function getCurrentUserRole() {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('Your session has expired. Please sign in again.')

  const { data, error } = await supabase.from('profiles').select('role').eq('id', userData.user.id).single()
  if (error) throw error
  return data.role as string
}

export { isSupabaseConfigured }
