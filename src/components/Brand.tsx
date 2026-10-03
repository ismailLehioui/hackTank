import { Link } from 'react-router-dom'

export function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" className="brand" onClick={onClick}>
      <span className="brand-mark">HT</span>
      <span><strong className="brand-hack">HACK</strong> <b>TANK</b></span>
    </Link>
  )
}
