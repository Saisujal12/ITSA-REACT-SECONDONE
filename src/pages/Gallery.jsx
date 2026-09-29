import { Camera, FolderOpen, Lightbulb, SquareArrowOutUpRight, Users } from 'lucide-react'
import AlbumCard from '../components/gallery/AlbumCard'
import GalleryHeroSlider from '../components/gallery/GalleryHeroSlider'
import { GALLERY_HERO_SLIDES, GALLERY_SECTIONS } from '../data/gallery'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cx } from '../utils/cx'
import s from './Gallery.module.css'

const HERO_META = [
  { icon: Camera, label: 'EVENTS' },
  { icon: Users, label: 'COMMUNITY' },
  { icon: Lightbulb, label: 'IDEAS' },
]

export default function Gallery() {
  useDocumentTitle('Gallery')

  return (
    <div className={s.page}>
      <section className={s.galleryHero} aria-labelledby="gallery-title">
        <div className={s.galleryHeroGrid}>
          <div className={s.galleryHeroCopy}>
            <div className={s.galleryKicker}>
              <span className={s.kickerLine} aria-hidden="true" />
              MOMENTS · PEOPLE · EXPERIENCES
            </div>
            <div className={s.galleryNumber} aria-hidden="true">
              03
            </div>
            <h1 id="gallery-title">
              OUR <span>GALLERY</span>
            </h1>
            <p>
              Snapshots of the ideas, energy and people that turn the IT Association into a living
              community.
            </p>
            <div className={s.galleryHeroMeta}>
              {HERO_META.map(({ icon: Icon, label }) => (
                <span key={label}>
                  <Icon aria-hidden="true" /> {label}
                </span>
              ))}
            </div>
          </div>

          <GalleryHeroSlider slides={GALLERY_HERO_SLIDES} />
        </div>
      </section>

      {GALLERY_SECTIONS.map((section, sectionIndex) => (
        <section
          key={section.id}
          className={cx(s.galleryContent, sectionIndex > 0 && s.sumshodiniWorkshopSection)}
          aria-labelledby={`${section.id}-title`}
        >
          <div className={s.gallerySectionHeading}>
            <div>
              <span>{section.eyebrow}</span>
              <h2 id={`${section.id}-title`}>
                {section.titleLead} <strong>{section.titleStrong}</strong>
              </h2>
            </div>
            <div className={s.recentEventsIntro}>
              <p>{section.intro}</p>
              {section.driveUrl && (
                <a href={section.driveUrl} target="_blank" rel="noopener noreferrer" className={s.galleryDriveButton}>
                  <FolderOpen size={15} aria-hidden="true" />
                  <span>{section.driveLabel}</span>
                  <SquareArrowOutUpRight size={14} aria-hidden="true" />
                  <span className="visually-hidden">(Google Drive, opens in a new tab)</span>
                </a>
              )}
            </div>
          </div>

          {section.albums.map((album, albumIndex) => (
            <AlbumCard key={album.id} album={album} number={String(albumIndex + 1).padStart(2, '0')} reverse={albumIndex % 2 === 1} />
          ))}
        </section>
      ))}
    </div>
  )
}
