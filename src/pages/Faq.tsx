import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { EVENT, FAQS } from '../data'

export function Faq() {
  const [active, setActive] = useState(0)

  return (
    <div className="page">
      <section className="page-hero">
        <p className="section-label">/ FAQ & CONTACT</p>
        <h1>Everything you<br /><span>need to know.</span></h1>
        <p className="page-hero-text">Still unsure? Here are the answers — and how to reach the {EVENT.org} team.</p>
      </section>

      <section className="section faq-page">
        <div className="faq-full">
          {FAQS.map((faq, index) => (
            <div className="faq-row" key={faq.question}>
              <button onClick={() => setActive(active === index ? -1 : index)} aria-expanded={active === index}>
                <span>{faq.question}</span>
                <b>{active === index ? '−' : '+'}</b>
              </button>
              {active === index && <p>{faq.answer}</p>}
            </div>
          ))}
        </div>

        <aside className="contact-card">
          <h3>Talk to us</h3>
          <a href="mailto:hello@hacktank.tn"><Mail size={16} /> hello@hacktank.tn</a>
          <a href="tel:+21600000000"><Phone size={16} /> +216 00 000 000</a>
          <span><MapPin size={16} /> {EVENT.location}</span>
          <Link className="primary" to="/register">Enter the Tank <span>↗</span></Link>
        </aside>
      </section>
    </div>
  )
}
