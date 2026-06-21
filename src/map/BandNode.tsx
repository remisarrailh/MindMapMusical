import { memo } from 'react'
import type { NodeProps } from '@xyflow/react'
import type { Band, Style } from '../types'

interface BandData {
  band: Band
  style: Style
  selected: boolean
  dropped: boolean
  onPlay: (band: Band) => void
  onOpen: (band: Band) => void
}

function BandNodeImpl({ data }: NodeProps) {
  const { band, style, selected, dropped, onPlay, onOpen } = data as unknown as BandData
  const hasVideo = band.videos.length > 0
  const initials = band.name.slice(0, 2).toUpperCase()

  return (
    <div
      className={`band-node${selected ? ' band-node--selected' : ''}${dropped ? ' band-node--dropped' : ''}`}
      style={{ borderColor: style.color }}
      onClick={() => onOpen(band)}
    >
      <div className="band-logo" style={{ background: band.logo ? undefined : `${style.color}22` }}>
        {band.logo ? (
          <img src={band.logo} alt="" draggable={false} />
        ) : (
          <span style={{ color: style.color }}>{initials}</span>
        )}
      </div>
      <div className="band-body">
        <div className="band-name" title={band.name}>
          {band.name}
        </div>
        <div className="band-styles">
          {band.styles.map((s) => (
            <span key={s} className="band-style-pill" style={{ borderColor: `${style.color}66` }}>
              {s}
            </span>
          ))}
        </div>
      </div>
      {hasVideo && (
        <button
          className="band-play"
          title="Écouter"
          style={{ background: style.color }}
          onClick={(e) => {
            e.stopPropagation()
            onPlay(band)
          }}
        >
          ▶
        </button>
      )}
    </div>
  )
}

export default memo(BandNodeImpl)
