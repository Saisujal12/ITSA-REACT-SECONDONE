import { BookOpen, FileText, ReceiptText, User, Users } from 'lucide-react'
import { PPT_ABSTRACT_MAX_LENGTH } from '../../../shared/pptRegistration'

export default function PptDetailsFields({ Field, register, values, errors }) {
  return (
    <>
      <Field id="reg-participantCount" number="08" label="NUMBER OF PARTICIPANTS" icon={Users} error={errors.participantCount} hint="₹200 per team, whether you register solo or with one teammate.">
        {(aria) => (
          <select {...register('participantCount')} {...aria} required>
            <option value="" disabled>Select team size</option>
            <option value="1">1 participant (solo)</option>
            <option value="2">2 participants</option>
          </select>
        )}
      </Field>
      {values.participantCount === '2' && (
        <Field id="reg-teamMemberName" number="09" label="SECOND TEAM MEMBER’S NAME" icon={User} error={errors.teamMemberName}>
          {(aria) => <input {...register('teamMemberName')} {...aria} placeholder="Teammate’s full name" maxLength={80} required />}
        </Field>
      )}
      <Field id="reg-topicTitle" number="10" label="PRESENTATION TOPIC" icon={BookOpen} error={errors.topicTitle}>
        {(aria) => <input {...register('topicTitle')} {...aria} placeholder="Title of your presentation" maxLength={200} required />}
      </Field>
      <Field id="reg-topicAbstract" number="11" label="TOPIC ABSTRACT" icon={FileText} error={errors.topicAbstract} hint="Briefly describe your topic, key ideas and what your audience will learn. Up to 10,000 characters.">
        {(aria) => <textarea {...register('topicAbstract')} {...aria} rows={7} maxLength={PPT_ABSTRACT_MAX_LENGTH} placeholder="Type your abstract here…" required />}
      </Field>
      <Field id="reg-paymentMethod" number="12" label="AMOUNT PAID IN" icon={ReceiptText} error={errors.paymentMethod} hint="All registrations remain pending until an organizer verifies payment.">
        {(aria) => (
          <select {...register('paymentMethod')} {...aria} required>
            <option value="" disabled>Select payment method</option>
            <option value="cash">Cash</option>
            <option value="online">Online</option>
          </select>
        )}
      </Field>
    </>
  )
}
