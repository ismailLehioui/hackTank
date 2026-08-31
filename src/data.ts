import type { Faq, Idea, Prize, Shark, Stat, TimelineStep, Track } from './types'

export const EVENT = {
  name: 'Hack Tank',
  org: 'JCI Sousse',
  tagline: 'Where builders pitch the sharks.',
  location: 'Sousse, Tunisia',
  dates: 'June 14 — 16, 2025',
  // Countdown target — kept in the future relative to the event build.
  startsAt: new Date('2025-06-14T09:00:00').toISOString(),
}

export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/tracks', label: 'Tracks & Prizes' },
  { to: '/sharks', label: 'The Sharks' },
  { to: '/ideas', label: 'Idea Wall' },
  { to: '/faq', label: 'FAQ' },
]

export const STATS: Stat[] = [
  { value: '48', label: 'Hours to build & pitch' },
  { value: '06', label: 'Pitch tracks' },
  { value: '50K', label: 'TND in deals' },
  { value: '12', label: 'Sharks on the panel' },
]

export const HOW_IT_WORKS = [
  { step: '01', title: 'Enter the Tank', text: 'Register solo or with your crew and claim your track.' },
  { step: '02', title: 'Build your venture', text: '48 hours to turn a raw idea into a working prototype.' },
  { step: '03', title: 'Pitch the Sharks', text: 'Face the panel. Defend your vision. Win them over.' },
  { step: '04', title: 'Secure the deal', text: 'The best pitches leave with funding, mentorship and momentum.' },
]

export const TRACKS: Track[] = [
  { id: 'ai', icon: '◈', name: 'AI & Humans', pitch: 'Intelligence that makes everyday life more human.', color: '#4b8dff' },
  { id: 'fintech', icon: '↗', name: 'Fintech', pitch: 'Reimagine how communities access and move money.', color: '#f4b400' },
  { id: 'sustainability', icon: '✦', name: 'Sustainability', pitch: 'Turn climate pressure into measurable progress.', color: '#46c985' },
  { id: 'smart-cities', icon: '⌁', name: 'Smart Cities', pitch: 'Design the systems that make cities feel alive.', color: '#ed7759' },
  { id: 'education', icon: '◎', name: 'Education', pitch: 'Unlock better ways to learn, teach and share.', color: '#a278ff' },
  { id: 'open', icon: '＋', name: 'Open Innovation', pitch: 'No box. No brief. Just your boldest venture.', color: '#57c9dd' },
]

export const SHARKS: Shark[] = [
  { name: 'Amira Ben Salah', role: 'Managing Partner', company: 'Delta Ventures', expertise: 'Seed & Series A', initials: 'AB', color: '#4b8dff', linkedin: '#' },
  { name: 'Youssef Karray', role: 'Founder & CEO', company: 'Nexa Labs', expertise: 'AI & SaaS', initials: 'YK', color: '#f4b400', linkedin: '#' },
  { name: 'Sonia Khelifi', role: 'Angel Investor', company: 'MedTech Angels', expertise: 'HealthTech', initials: 'SK', color: '#46c985', linkedin: '#' },
  { name: 'Karim Trabelsi', role: 'Partner', company: 'Sahel Capital', expertise: 'Fintech', initials: 'KT', color: '#ed7759', linkedin: '#' },
  { name: 'Leila Mansour', role: 'Head of Product', company: 'Orbit', expertise: 'Product & Growth', initials: 'LM', color: '#a278ff', linkedin: '#' },
  { name: 'Hedi Gharbi', role: 'Serial Entrepreneur', company: '3x Exits', expertise: 'Go-to-market', initials: 'HG', color: '#57c9dd', linkedin: '#' },
]

export const TIMELINE: TimelineStep[] = [
  { phase: '01', title: 'Registration open', date: 'May 01 — June 10', detail: 'Claim your spot in the Tank, solo or as a team.' },
  { phase: '02', title: 'Team formation', date: 'June 11 — 13', detail: 'Find teammates and lock in your track.' },
  { phase: '03', title: 'Build sprint', date: 'June 14 — 15', detail: '48 hours to build with mentors on standby.' },
  { phase: '04', title: 'Pitch the Sharks', date: 'June 16 · 14:00', detail: 'Five minutes on stage to win the panel.' },
  { phase: '05', title: 'Deliberation', date: 'June 16 · 17:00', detail: 'The Sharks debate and score every venture.' },
  { phase: '06', title: 'Deals & awards', date: 'June 16 · 19:00', detail: 'Funding, mentorship and the winning handshake.' },
]

export const PRIZES: Prize[] = [
  { rank: '01 / GOLD', tier: 'The Deal', amount: '25K', unit: 'TND', glyph: '✦', className: 'prize-gold', perks: ['Seed funding offer', '6 months of mentorship', 'Incubation seat'] },
  { rank: '02 / SILVER', tier: 'The Challenger', amount: '15K', unit: 'TND', glyph: '✧', className: 'prize-silver', perks: ['Growth grant', '3 months of mentorship', 'Investor intros'] },
  { rank: '03 / BRONZE', tier: 'The Spark', amount: '10K', unit: 'TND', glyph: '◌', className: 'prize-bronze', perks: ['Kickstart grant', 'Workshop access', 'Community spotlight'] },
]

export const IDEAS: Idea[] = [
  { title: 'MedQueue', track: 'AI & Humans', author: 'Team Pulse', blurb: 'Cut clinic waiting times with predictive scheduling.', seeking: 'Backend · Data' },
  { title: 'GreenLedger', track: 'Sustainability', author: 'Team Terra', blurb: 'Carbon tracking for small Tunisian businesses.', seeking: 'Frontend · Business' },
  { title: 'Dinar', track: 'Fintech', author: 'Solo · Rami', blurb: 'Micro-savings that round up every purchase.', seeking: 'Mobile · Design' },
  { title: 'CityPulse', track: 'Smart Cities', author: 'Team Medina', blurb: 'Crowd-sourced maps of city issues in real time.', seeking: 'DevOps · UI/UX' },
  { title: 'Tutorly', track: 'Education', author: 'Solo · Nour', blurb: 'Peer tutoring marketplace for students.', seeking: 'Full-stack' },
  { title: 'Loop', track: 'Open Innovation', author: 'Team Vertex', blurb: 'Turn local recycling into rewards.', seeking: 'AI · Product' },
]

export const FAQS: Faq[] = [
  { question: 'What does “pitch the sharks” actually mean?', answer: 'After 48 hours of building, each team gets five minutes on stage to pitch their venture to a panel of investors and mentors — our Sharks — followed by a short Q&A. The best pitches leave with real deals.' },
  { question: 'Do I need a team to register?', answer: 'No. You can enter the Tank solo and find teammates during the team formation phase, or use the Idea Wall to connect before the event.' },
  { question: 'Do I need a finished idea?', answer: 'Not at all. Bring an idea or find one on the day. What matters is your energy to build and pitch something meaningful.' },
  { question: 'Who can participate?', answer: 'Students, professionals, designers, developers and entrepreneurs are all welcome. Curiosity matters more than your job title.' },
  { question: 'How much does it cost?', answer: 'Participation is free. Meals, workspace and mentorship during the event are covered by JCI Sousse and our partners.' },
  { question: 'What should I bring?', answer: 'Your laptop, charger, an open mind and the ambition to build something worth pitching.' },
]

export const SKILLS = ['Frontend', 'Backend', 'DevOps', 'Mobile', 'UI/UX', 'Data Science', 'AI', 'Product Management', 'Marketing', 'Business']

export const EXPERIENCE_LEVELS = ['Student', 'Early career', 'Experienced', 'Senior / Founder']
