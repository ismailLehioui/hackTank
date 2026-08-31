export type Track = {
  id: string
  icon: string
  name: string
  pitch: string
  color: string
}

export type Shark = {
  name: string
  role: string
  company: string
  expertise: string
  initials: string
  color: string
  linkedin: string
}

export type TimelineStep = {
  phase: string
  title: string
  date: string
  detail: string
}

export type Prize = {
  rank: string
  tier: string
  amount: string
  unit: string
  perks: string[]
  glyph: string
  className: string
}

export type Faq = {
  question: string
  answer: string
}

export type Idea = {
  title: string
  track: string
  author: string
  blurb: string
  seeking: string
}

export type Stat = {
  value: string
  label: string
}

export type RegistrationData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  age: string
  city: string
  country: string
  university: string
  company: string
  position: string
  experience: string
  skills: string[]
  hasTeam: string
  teamName: string
  track: string
  idea: string
  problem: string
  lookingForTeammates: boolean
  acceptRules: boolean
}
