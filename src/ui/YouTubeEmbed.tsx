import { useState } from 'react'
import { youtubeEmbedUrl, youtubeThumb } from '../youtube'

interface Props {
  youtubeId: string
  title?: string
  /** true = charge directement l'iframe (autoplay). false = miniature cliquable. */
  autoload?: boolean
}

export default function YouTubeEmbed({ youtubeId, title, autoload = false }: Props) {
  const [active, setActive] = useState(autoload)

  if (active) {
    return (
      <div className="yt-frame">
        <iframe
          src={youtubeEmbedUrl(youtubeId, true)}
          title={title ?? youtubeId}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button className="yt-thumb" onClick={() => setActive(true)} title={title}>
      <img src={youtubeThumb(youtubeId)} alt={title ?? ''} loading="lazy" />
      <span className="yt-play">▶</span>
    </button>
  )
}
