import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Brand } from './Brand'
import { InstagramIcon, LinkedinIcon } from './icons'
import { EVENT, NAV_LINKS } from '../data'
import { DEFAULT_SITE_SETTINGS, getSiteSettings, type SiteSettings } from '../services/registrations'

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS)

  useEffect(() => {
    let active = true
    void getSiteSettings()
      .then((nextSettings) => {
        if (active) setSettings(nextSettings)
      })
      .catch(() => {
        // Retain the existing public contact details if settings cannot be fetched.
      })
    return () => { active = false }
  }, [])

  const phoneLink = settings.contact_phone.replace(/[^\d+]/g, '')

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Brand />
          <p>{EVENT.tagline}<br /></p>
          <div className="footer-jci-signature">
            <img className="footer-jci-image" src="/jci_sousse.png" alt="JCI Sousse" />
            <span>POWERED BY <strong>JCI SOUSSE</strong></span>
          </div>
          <div className="footer-social">
            {settings.linkedin_url && <a href={settings.linkedin_url} target="_blank" rel="noreferrer" aria-label="JCI Sousse on LinkedIn"><LinkedinIcon size={18} /></a>}
            {settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer" aria-label="JCI Sousse on Instagram"><InstagramIcon size={18} /></a>}
            {settings.contact_email && <a href={`mailto:${settings.contact_email}`} aria-label="Email"><Mail size={18} /></a>}
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
            {settings.contact_email && <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>}
            {settings.contact_phone && <a href={`tel:${phoneLink}`}>{settings.contact_phone}</a>}
            {settings.linkedin_url && <a href={settings.linkedin_url} target="_blank" rel="noreferrer">JCI Sousse</a>}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 {EVENT.org} — {EVENT.name}</span>
        <span>Made for the bold.</span>
      </div>
    </footer>
  )
}
