import { Link } from 'react-router-dom'
import type { Track } from '../types'
import type { CSSProperties } from 'react'

export function TrackCard({ track, index }: { track: Track; index: number }) {
  return (
    <Link
      to="/tracks"
      className="track-card"
      style={{ '--track-color': track.color } as CSSProperties}
    >
      <div className="track-top">
        <span className="track-icon">{track.icon}</span>
        <span>0{index + 1}</span>
      </div>
      <h3>{track.name}</h3>
      <p>{track.pitch}</p>
      <span className="card-arrow">↗</span>
    </Link>
  )
}
