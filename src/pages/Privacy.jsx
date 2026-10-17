import { useDocumentTitle } from '../hooks/useDocumentTitle'
import s from './Privacy.module.css'

export default function Privacy() {
  useDocumentTitle('Privacy Policy')

  return (
    <article className={s.page}>
      <header>
        <p className={s.eyebrow}>IT ASSOCIATION · KITS WARANGAL</p>
        <h1>Privacy Policy</h1>
        <p>Last updated: 17 October 2026</p>
      </header>

      <section>
        <h2>About this policy</h2>
        <p>This policy explains how the IT Association website at kitsw-itsa.vercel.app handles information for event and workshop registrations. It also covers the Google integration named “IT Association Screenshot Upload”, which organizers use to store payment screenshots.</p>
      </section>
      <section>
        <h2>Information we collect and why</h2>
        <p>When you register, we collect the details you submit, such as your name, college, roll number, year, branch, email address, phone number, event selection, meal preference where requested, payment transaction reference and payment screenshot. We also create a registration ID, timestamps and registration status.</p>
        <p>These details support registration, payment verification, event administration, duplicate-payment-reference checks and registration-related emails. Upload only the payment evidence needed for verification; conceal unrelated balances or transactions. Do not submit passwords, PINs or one-time passwords.</p>
      </section>
      <section>
        <h2>Google Drive, Google Sheets and Google account access</h2>
        <p>Registration records and payment references are stored using Google Sheets, and payment screenshots are uploaded to Google Drive. Registration records include a link to the uploaded screenshot.</p>
        <p>The screenshot integration asks an organizer to authorize a Google account using the drive.file permission, which allows access to files created by or specifically shared with this app. Its purpose is to create the screenshot folder and upload or manage payment evidence. Participants do not need to grant access to their own Google Drive to register.</p>
        <p>Google authorization credentials are used by the server to maintain this connection. They are not requested from participants or displayed as part of registration.</p>
      </section>
      <section>
        <h2>Storage, access and service providers</h2>
        <p>Organizers with access to the administration tools, registration spreadsheets or screenshot folder can review information to manage registrations and verify payments. Access to Google files also depends on the sharing settings maintained by the account owner.</p>
        <p>The website uses Vercel for hosting and Google services for storage and registration email delivery. These providers process information needed to operate those services and may process it outside your country. Hosting and server logs may include technical request information and errors for troubleshooting and security.</p>
      </section>
      <section>
        <h2>Retention and deletion requests</h2>
        <p>Registration records and screenshots do not currently have an automated deletion schedule. Contact the association to ask about retention or request deletion of your information. Organizers will review requests in light of event administration, payment reconciliation and any applicable recordkeeping obligations.</p>
        <p>Disconnecting the organizer’s Google authorization stops future authorized access but does not automatically delete records or screenshots already stored.</p>
      </section>
      <section>
        <h2>Cookies and your choices</h2>
        <p>The administration area uses a session cookie to keep authorized organizers signed in. You can control cookies through your browser settings; blocking them may prevent administrator sign-in.</p>
        <p>You can choose not to submit a registration. Required details and payment evidence are needed to process one. To request access, correction or deletion, email the contact below with your registration ID if available. Do not include Google credentials or additional sensitive payment information.</p>
      </section>
      <section>
        <h2>Contact and updates</h2>
        <p>For privacy questions or requests, contact the IT Association at <a href="mailto:itassociation.notifications@gmail.com">itassociation.notifications@gmail.com</a>.</p>
        <p>Changes to this policy will be published on this page with an updated date.</p>
      </section>
    </article>
  )
}
