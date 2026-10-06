import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Brand } from './Brand'
import { InstagramIcon } from './icons'
import { NAV_LINKS } from '../data'

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="nav">
      <div className="nav-brand-group">
        <Link to="/" className="nav-jci-logo" aria-label="JCI Sousse home" onClick={() => setOpen(false)}>
          <img src="/jci_sousse.png" alt="JCI Sousse" />
        </Link>
        <Brand onClick={() => setOpen(false)} />
      </div>
      <nav className={`nav-links ${open ? 'open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
        <Link to="/register" className="nav-cta mobile-only" onClick={() => setOpen(false)}>
          Enter the Tank 
          {/* <span>↗</span> */}
        </Link>
        <a className="nav-social mobile-only" href="https://www.instagram.com/hack_tank/" target="_blank" rel="noreferrer">
          <InstagramIcon size={17} /> Follow the Tank
        </a>
      </nav>
      <div className="nav-actions">
        <a className="nav-social desktop-only" href="https://www.instagram.com/hack_tank/" target="_blank" rel="noreferrer">
          <InstagramIcon size={17} /> Follow the Tank
        </a>
        <Link to="/register" className="nav-cta desktop-only">Enter the Tank</Link>
        <button className="nav-toggle" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  )
}
