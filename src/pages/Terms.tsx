import { Link } from 'react-router-dom'
import { EVENT } from '../data'

export function Terms() {
  return (
    <div className="page">
      <section className="page-hero">
        <p className="section-label">/ TERMS & CONDITIONS</p>
        <h1>Participation terms<br /><span>& conditions.</span></h1>
        <p className="page-hero-text">
          Last updated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </p>
      </section>

      <section className="section faq-page">
        <div className="faq-full">
          <div className="faq-row" style={{ display: 'block' }}>
            <h3>1. Presentation of the event</h3>
            <p>
              Hack Tank is an event organized by JCI Sousse, bringing together participants around innovation,
              technology, creativity, and the development of solutions to concrete challenges.
            </p>
            <p>
              These terms and conditions define the rules applicable to registration and participation in the event.
            </p>

            <h3>2. Registration conditions</h3>
            <ul>
              <li>All registration must be completed through the official form available on the Hack Tank website.</li>
              <li>Participants must provide accurate, complete, and up-to-date information.</li>
              <li>Each participant is responsible for the accuracy of the information provided.</li>
              <li>Registration is considered confirmed after validation by the organizing team and, if applicable, after receipt of the required payment.</li>
              <li>The organizing team reserves the right to refuse or cancel a registration in case of incorrect information, fraud, or non-compliance with these terms.</li>
            </ul>

            <h3>3. Participation fees and payment</h3>
            <ul>
              <li>Any participation fees are indicated on the official website or communicated by the organizing team.</li>
              <li>Participants must follow the payment instructions corresponding to the payment method chosen during registration.</li>
              <li>Proof of payment may be requested to verify the transaction.</li>
              <li>Registration does not automatically guarantee a place until any validation conditions are met.</li>
              <li>Refund conditions are those specified by the organizer in the event refund policy.</li>
            </ul>

            <h3>4. Participation rules</h3>
            <p>Participants agree to:</p>
            <ul>
              <li>Respect other participants, mentors, speakers, jury members, and the organizing team.</li>
              <li>Adopt respectful, professional, and inclusive behavior.</li>
              <li>Respect the program, schedules, safety instructions, and rules communicated during the event.</li>
              <li>Use the equipment and resources provided in a responsible manner.</li>
              <li>Not disrupt the event or infringe the rights of others.</li>
            </ul>
            <p>Any inappropriate, fraudulent, discriminatory, or dangerous behavior may result in exclusion from the event, depending on the severity of the facts.</p>

            <h3>5. Teams and projects</h3>
            <ul>
              <li>Participants must respect the team formation and project submission procedures communicated by the organization.</li>
              <li>Projects presented must be created in compliance with applicable laws and intellectual property rights.</li>
              <li>Participants guarantee that they have the necessary authorizations to use all code, libraries, data, images, and other resources included in their projects.</li>
              <li>Projects must not contain illegal, malicious, or infringing content.</li>
              <li>Evaluation criteria and winner selection procedures are communicated by the organization.</li>
            </ul>

            <h3>6. Intellectual property</h3>
            <p>
              Participants retain the rights they hold over their creations and projects, subject to third-party rights and applicable licenses.
            </p>
            <p>
              Participation in Hack Tank does not, by itself, transfer intellectual property to JCI Sousse or the event sponsors.
            </p>

            <h3>7. Photography, video and communication</h3>
            <p>
              Photographs, videos, or recordings may be taken during the event for communication and promotional purposes.
            </p>
            <p>
              Participants may contact the organizing team with any questions regarding the use of their image.
            </p>

            <h3>8. Personal data</h3>
            <p>
              The data provided during registration is used to manage applications, communicate with participants, organize the event, and ensure the administrative follow-up of registrations and payments.
            </p>
            <p>
              Participants may request information about their personal data, ask for its correction, or, where legally permitted, delete it by contacting the organizing team at hello@hacktank.tn.
            </p>

            <h3>9. Cancellation and modification of the event</h3>
            <p>
              The organizing team reserves the right to modify the program, schedule, venue, or event procedures when necessary.
            </p>

            <h3>10. Liability</h3>
            <p>
              Participants are responsible for their personal belongings, equipment, and actions during the event.
            </p>
            <p>
              The organizer makes reasonable efforts to ensure the smooth running of Hack Tank, without guaranteeing the absence of any incident or interruption.
            </p>

            <h3>11. Acceptance of the terms</h3>
            <p>
              By submitting an application, the participant acknowledges having read and understood these terms and conditions and agrees to comply with them.
            </p>

            <h3>12. Contact</h3>
            <p>
              <strong>Organizer:</strong> JCI Sousse<br />
              <strong>Email:</strong> jci.sousse.ong@gmail.com<br />
              <strong>Website:</strong> <a href="https://hack-tank.vercel.app/" target="_blank" rel="noreferrer">https://hack-tank.vercel.app/</a>
            </p>
          </div>
        </div>

        <aside className="contact-card">
          <h3>Questions?</h3>
          <p>For any questions about registrations, payments, or these conditions, please contact the organizing team.</p>
          <Link className="primary" to="/register">Register</Link>
        </aside>
      </section>
    </div>
  )
}
