import { BookOpen, FileText, User, Users } from 'lucide-react'

export default function PptDetailsFields({ Field, register, values, errors, onAbstractFile, abstractInputRef, abstractProgress, abstractUploading }) {
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
      <Field id="reg-topicAbstract" number="11" label="UPLOAD TOPIC ABSTRACT" icon={FileText} error={errors.topicAbstract} hint={abstractUploading ? `Uploading document… ${abstractProgress}%` : values.abstractDocument ? `${values.abstractDocument.fileName} — ready to submit. Choose another file to replace it.` : 'Upload your own PDF or DOCX document. Maximum 10 MB.'}>
        {(aria) => <input {...aria} id="reg-topicAbstract" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" ref={(element) => { abstractInputRef.current = element; register('topicAbstract').ref(element) }} onChange={(event) => onAbstractFile(event.target.files?.[0])} required />}
      </Field>
    </>
  )
}
