import { ABOUT_TEAM_GROUPS, getPerson } from '../../data/team'
import ImageWithFallback from '../ui/ImageWithFallback'
import { cx } from '../../utils/cx'
import s from '../../pages/About.module.css'

const GROUP_TONES = {
  hod: s.teamGroupHod,
  faculty: s.teamGroupFaculty,
  leadership: s.teamGroupLeadership,
  coordination: s.teamGroupCoordination,
}

const GRID_LAYOUTS = { two: s.teamGroupGridTwo, four: s.teamGroupGridFour }

function RoleCard({ card, wide }) {
  const Icon = card.icon
  const person = getPerson(card.person)

  return (
    <article className={cx(s.teamCard, wide && s.teamCardWide)}>
      <div className={s.teamCardTop}>
        <span aria-hidden="true">{card.code}</span>
        <Icon aria-hidden="true" />
      </div>
      <div className={s.teamCardContent}>
        <span>{card.tag}</span>
        <h4>{card.title}</h4>
        <p>{card.text}</p>
        {person?.name && <strong className={s.teamCardName}>{person.name}</strong>}
      </div>
    </article>
  )
}

function MemberCard({ member }) {
  const displayName = member.name ?? member.placeholderName

  return (
    <article className={s.teamMemberCard}>
      <div className={s.memberPhoto}>
        <ImageWithFallback
          imageKey={member.photo}
          alt={member.name ?? ''}
          sizes="(max-width: 700px) 50vw, 25vw"
          fallback={<span aria-hidden="true">PHOTO</span>}
        />
      </div>
      <div className={s.teamMemberInfo}>
        <span>{member.label}</span>
        <h4 data-placeholder={member.name ? undefined : ''}>{displayName}</h4>
        <p>{member.description}</p>
      </div>
    </article>
  )
}

export default function AboutTeam() {
  return (
    <div className={s.teamBody}>
      {ABOUT_TEAM_GROUPS.map((group) => (
        <section
          key={group.id}
          className={cx(s.teamGroup, GROUP_TONES[group.id])}
          aria-labelledby={`team-${group.id}`}
          data-reveal=""
        >
          <div className={s.teamGroupHeading}>
            <span aria-hidden="true">{group.number}</span>
            <div>
              <small>{group.kicker}</small>
              <h3 id={`team-${group.id}`}>{group.title}</h3>
            </div>
          </div>

          {group.members ? (
            <div className={s.teamMemberGrid}>
              {group.members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : group.layout === 'wide' ? (
            <RoleCard card={group.cards[0]} wide />
          ) : (
            <div className={cx(s.teamGroupGrid, GRID_LAYOUTS[group.layout])}>
              {group.cards.map((card) => (
                <RoleCard key={card.code} card={card} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
