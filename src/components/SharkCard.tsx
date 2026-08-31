import { LinkedinIcon } from './icons'
import type { Shark } from '../types'
import type { CSSProperties } from 'react'

export function SharkCard({ shark }: { shark: Shark }) {
  return (
    <article className="shark-card" style={{ '--shark-color': shark.color } as CSSProperties}>
      <div className="shark-avatar">{shark.initials}</div>
      <div className="shark-body">
        <h3>{shark.name}</h3>
        <p className="shark-role">{shark.role}</p>
        <p className="shark-company">{shark.company}</p>
        <span className="shark-tag">{shark.expertise}</span>
      </div>
      <a className="shark-link" href={shark.linkedin} aria-label={`${shark.name} on LinkedIn`}>
        <LinkedinIcon size={16} />
      </a>
    </article>
  )
}
