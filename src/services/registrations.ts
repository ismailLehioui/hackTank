import type { Idea, RegistrationData, Shark } from "../types";
import { isSupabaseConfigured, supabase } from "./supabase";

export type ParticipantRecord = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  country: string;
  school: string | null;
  company: string | null;
  position: string | null;
  experience_level: string | null;
  has_team: boolean;
  looking_for_teammates: boolean;
  created_at: string;
};

export type DashboardStats = {
  participants: number;
  teams: number;
  projects: number;
  mentors: number;
  jury: number;
  sponsors: number;
};

export type JuryMemberRecord = {
  id: string;
  full_name: string;
  position: string | null;
  company: string | null;
  user_id: string | null;
};

export type PublicJuryMember = {
  id: string;
  full_name: string;
  position: string | null;
  company: string | null;
  bio: string | null;
  linkedin_url: string | null;
};

export type PublicIdea = Idea & { id: string };

export type TeamRecord = {
  id: string;
  team_name: string;
  slogan: string | null;
  created_at: string;
  members: Array<{
    participant_id: string;
    name: string;
    email: string;
    is_leader: boolean;
  }>;
  project: {
    id: string;
    project_name: string;
    category: string | null;
    description: string | null;
    problem_statement: string | null;
    solution: string | null;
  } | null;
};

export type AdminProjectRecord = {
  id: string;
  team_id: string | null;
  project_name: string;
  category: string | null;
};

export async function submitRegistration(data: RegistrationData) {
  if (!supabase) throw new Error("Supabase is not configured");

  const { error } = await supabase.rpc("submit_registration", {
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
    p_skills: [],
    p_has_team: data.hasTeam === "Yes, we’re a team",
    p_team_name: data.teamName,
    p_track: "",
    p_idea: "",
    p_problem: "",
    p_looking_for_teammates: false,
  });

  if (error) throw error;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!supabase) throw new Error("Supabase is not configured");
  const client = supabase;
  const tables = [
    "participants",
    "teams",
    "projects",
    "mentors",
    "jury_members",
    "sponsors",
  ] as const;
  const results = await Promise.all(
    tables.map((table) =>
      client.from(table).select("*", { count: "exact", head: true }),
    ),
  );
  const failure = results.find((result) => result.error);
  if (failure?.error) throw failure.error;

  return {
    participants: results[0].count ?? 0,
    teams: results[1].count ?? 0,
    projects: results[2].count ?? 0,
    mentors: results[3].count ?? 0,
    jury: results[4].count ?? 0,
    sponsors: results[5].count ?? 0,
  };
}

export async function getParticipants(): Promise<ParticipantRecord[]> {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ParticipantRecord[];
}

export async function getJuryMembers(): Promise<JuryMemberRecord[]> {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .from("jury_members")
    .select("id, full_name, position, company, user_id")
    .order("full_name", { ascending: true });
  if (error) throw error;
  return data as JuryMemberRecord[];
}

export async function getPublicJury(): Promise<PublicJuryMember[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("jury_members")
    .select("id, full_name, position, company, bio, linkedin_url")
    .order("full_name", { ascending: true });
  if (error) throw error;
  return data as PublicJuryMember[];
}

const PUBLIC_JURY_COLORS = [
  "#4b8dff",
  "#7FFF00",
  "#57c9dd",
  "#ed7759",
  "#a278ff",
  "#46c985",
];

export async function getPublicSharks(): Promise<Shark[]> {
  const members = await getPublicJury();
  return members.map((member, index) => {
    const nameParts = member.full_name.trim().split(/\s+/).filter(Boolean);
    const initials =
      nameParts
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "J";
    return {
      name: member.full_name,
      role: member.position || "Jury member",
      company: member.company || "Hack Tank Jury",
      expertise: member.bio || "Investor & mentor",
      initials,
      color: PUBLIC_JURY_COLORS[index % PUBLIC_JURY_COLORS.length],
      linkedin: member.linkedin_url || "#",
    };
  });
}

export async function getPublicIdeas(): Promise<PublicIdea[]> {
  if (!supabase) return [];
  const [projectsResult, teamsResult] = await Promise.all([
    supabase
      .from("projects")
      .select("id, project_name, category, description, team_id")
      .order("created_at", { ascending: false }),
    supabase.from("teams").select("id, team_name"),
  ]);
  const error = projectsResult.error || teamsResult.error;
  if (error) throw error;
  const teams = new Map(
    (teamsResult.data ?? []).map((team) => [team.id, team.team_name]),
  );
  return (projectsResult.data ?? []).map((project) => ({
    id: project.id,
    title: project.project_name,
    track: project.category || "Open Innovation",
    author: project.team_id
      ? teams.get(project.team_id) || "Community venture"
      : "Solo builder",
    blurb: project.description || "A new venture taking shape in the Tank.",
    seeking: project.team_id ? "Feedback" : "Teammates",
  }));
}

export async function createJuryMember(
  values: Pick<JuryMemberRecord, "full_name" | "company" | "position">,
) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .from("jury_members")
    .insert({
      full_name: values.full_name,
      company: values.company || null,
      position: values.position || null,
    })
    .select("id, full_name, position, company, user_id")
    .single();
  if (error) throw error;
  return data as JuryMemberRecord;
}

export async function updateJuryMember(
  id: string,
  values: Pick<JuryMemberRecord, "full_name" | "company" | "position">,
) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .from("jury_members")
    .update({
      full_name: values.full_name,
      company: values.company || null,
      position: values.position || null,
    })
    .eq("id", id)
    .select("id, full_name, position, company, user_id")
    .single();
  if (error) throw error;
  return data as JuryMemberRecord;
}

export async function deleteJuryMember(id: string) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.from("jury_members").delete().eq("id", id);
  if (error) throw error;
}

export async function getTeams(): Promise<TeamRecord[]> {
  if (!supabase) throw new Error("Supabase is not configured");
  const [teamsResult, membersResult, participantsResult, projectsResult] =
    await Promise.all([
      supabase
        .from("teams")
        .select("id, team_name, slogan, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("team_members")
        .select("team_id, participant_id, is_leader"),
      supabase.from("participants").select("id, first_name, last_name, email"),
      supabase
        .from("projects")
        .select(
          "id, team_id, project_name, category, description, problem_statement, solution",
        ),
    ]);
  const error =
    teamsResult.error ||
    membersResult.error ||
    participantsResult.error ||
    projectsResult.error;
  if (error) throw error;

  const participants = new Map(
    (participantsResult.data ?? []).map((participant) => [
      participant.id,
      participant,
    ]),
  );
  const projects = new Map(
    (projectsResult.data ?? []).map((project) => [project.team_id, project]),
  );
  return (teamsResult.data ?? []).map((team) => ({
    ...team,
    members: (membersResult.data ?? [])
      .filter((member) => member.team_id === team.id)
      .map((member) => {
        const participant = participants.get(member.participant_id);
        return {
          participant_id: member.participant_id,
          name: participant
            ? `${participant.first_name} ${participant.last_name}`
            : "Unknown participant",
          email: participant?.email ?? "",
          is_leader: member.is_leader,
        };
      }),
    project: projects.get(team.id) ?? null,
  })) as TeamRecord[];
}

export async function getAdminProjects(): Promise<AdminProjectRecord[]> {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .from("projects")
    .select("id, team_id, project_name, category")
    .order("project_name", { ascending: true });
  if (error) throw error;
  return data as AdminProjectRecord[];
}

export async function associateProjectToTeam(
  teamId: string,
  projectId: string,
  previousProjectId?: string,
) {
  if (!supabase) throw new Error("Supabase is not configured");
  if (previousProjectId && previousProjectId !== projectId) {
    const { error: clearError } = await supabase
      .from("projects")
      .update({ team_id: null })
      .eq("id", previousProjectId);
    if (clearError) throw clearError;
  }
  const { data, error } = await supabase
    .from("projects")
    .update({ team_id: teamId })
    .eq("id", projectId)
    .select(
      "id, team_id, project_name, category, description, problem_statement, solution",
    )
    .single();
  if (error) throw error;
  return data;
}

export async function updateTeam(
  id: string,
  values: Pick<TeamRecord, "team_name" | "slogan">,
) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .from("teams")
    .update({
      team_name: values.team_name,
      slogan: values.slogan || null,
    })
    .eq("id", id)
    .select("id, team_name, slogan, created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTeam(id: string) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) throw error;
}

export async function addParticipantToTeam(
  teamId: string,
  participantId: string,
) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.from("team_members").insert({
    team_id: teamId,
    participant_id: participantId,
    is_leader: false,
  });
  if (error) throw error;
}

export async function setTeamLeader(teamId: string, participantId: string) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error: clearError } = await supabase
    .from("team_members")
    .update({ is_leader: false })
    .eq("team_id", teamId);
  if (clearError) throw clearError;
  const { error } = await supabase
    .from("team_members")
    .update({ is_leader: true })
    .eq("team_id", teamId)
    .eq("participant_id", participantId);
  if (error) throw error;
}

export async function updateProject(
  id: string,
  values: Pick<
    NonNullable<TeamRecord["project"]>,
    | "project_name"
    | "category"
    | "description"
    | "problem_statement"
    | "solution"
  >,
) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .from("projects")
    .update(values)
    .eq("id", id)
    .select(
      "id, team_id, project_name, category, description, problem_statement, solution",
    )
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function getCurrentUserRole() {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user)
    throw new Error("Your session has expired. Please sign in again.");

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (error) throw error;
  return data.role as string;
}

export { isSupabaseConfigured };
