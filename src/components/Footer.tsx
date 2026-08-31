import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Brand } from './Brand'
import { GithubIcon, InstagramIcon, LinkedinIcon } from './icons'
import { EVENT, NAV_LINKS } from '../data'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Brand />
          <p>{EVENT.tagline}<br />Powered by {EVENT.org}.</p>
          <div className="footer-social">
            <a href="#" aria-label="LinkedIn"><LinkedinIcon size={18} /></a>
            <a href="#" aria-label="Instagram"><InstagramIcon size={18} /></a>
            <a href="#" aria-label="GitHub"><GithubIcon size={18} /></a>
            <a href="mailto:hello@hacktank.tn" aria-label="Email"><Mail size={18} /></a>
          </div>
        </div>
        <div className="footer-cols">
          <div>
            <h4>Explore</h4>
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to}>{link.label}</Link>
            ))}
          </div>
          <div>
            <h4>Event</h4>
            <span>{EVENT.dates}</span>
            <span>{EVENT.location}</span>
            <Link to="/register">Register now</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <a href="mailto:hello@hacktank.tn">hello@hacktank.tn</a>
            <span>+216 00 000 000</span>
            <a href="#">JCI Sousse</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 {EVENT.org} — {EVENT.name}</span>
        <span>Made for the bold.</span>
      </div>
    </footer>
  )
}
