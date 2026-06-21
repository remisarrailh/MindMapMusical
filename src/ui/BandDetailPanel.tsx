import { useState } from 'react'
import type { Band, Style } from '../types'
import YouTubeEmbed from './YouTubeEmbed'

interface Props {
  band: Band
  styles: Style[]
  /** Index de la vidéo à ouvrir d'emblée (depuis le bouton ▶), sinon null. */
  initialVideo?: number | null
  onEdit: (band: Band) => void
  onDelete: (band: Band) => void
  onClose: () => void
}

export default function BandDetailPanel({ band, styles, initialVideo, onEdit, onDelete, onClose }: Props) {
  const [openVideo, setOpenVideo] = useState<number | null>(initialVideo ?? null)
  const styleLabel = (id: string) => styles.find((s) => s.id === id)?.label ?? id

  return (
    <aside className="panel">
      <div className="panel-head">
        <h2>{band.name}</h2>
        <button className="icon-btn" onClick={onClose} title="Fermer">
          ✕
        </button>
      </div>

      <div className="panel-styles">
        {band.styles.map((s) => (
          <span key={s} className="pill">
            {styleLabel(s)}
          </span>
        ))}
      </div>

      {band.logo && (
        <img className="panel-logo" src={band.logo} alt={band.name} />
      )}

      {band.info && <p className="panel-info">{band.info}</p>}

      {band.videos.length > 0 && (
        <section className="panel-section">
          <h3>Vidéos</h3>
          <div className="panel-videos">
            {band.videos.map((v, i) => (
              <div key={`${v.youtubeId}-${i}`} className="panel-video">
                {v.title && <div className="panel-video-title">{v.title}</div>}
                <YouTubeEmbed youtubeId={v.youtubeId} title={v.title} autoload={openVideo === i} />
                {openVideo !== i && (
                  <button className="link-btn" onClick={() => setOpenVideo(i)}>
                    ▶ Lire ici
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {band.links.length > 0 && (
        <section className="panel-section">
          <h3>Liens</h3>
          <ul className="panel-links">
            {band.links.map((l, i) => (
              <li key={i}>
                <a href={l.url} target="_blank" rel="noreferrer">
                  {l.label || l.url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {band.concertsUrl && (
        <section className="panel-section">
          <a className="concerts-btn" href={band.concertsUrl} target="_blank" rel="noreferrer">
            📅 Dates de concerts
          </a>
        </section>
      )}

      <div className="panel-actions">
        <button className="btn" onClick={() => onEdit(band)}>
          ✎ Éditer
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(band)}>
          🗑 Supprimer
        </button>
      </div>
    </aside>
  )
}
