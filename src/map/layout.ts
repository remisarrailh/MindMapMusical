import type { Node } from '@xyflow/react'
import type { Band, Style } from '../types'

export const BAND_NODE_WIDTH = 280
export const BAND_NODE_HEIGHT = 150

// Disposition automatique des cartes sans position (grille aérée).
const AUTO_COLS = 4
const AUTO_SPACING_X = 320
const AUTO_SPACING_Y = 200
const AUTO_ORIGIN_X = 80
const AUTO_ORIGIN_Y = 80

const FALLBACK_STYLE: Style = { id: '', label: '', color: '#8a93a3' }

/** Position auto-attribuée à une carte jamais déplacée (grille). */
function autoPosition(order: number): { x: number; y: number } {
  return {
    x: AUTO_ORIGIN_X + (order % AUTO_COLS) * AUTO_SPACING_X,
    y: AUTO_ORIGIN_Y + Math.floor(order / AUTO_COLS) * AUTO_SPACING_Y,
  }
}

interface BuildArgs {
  bands: Band[]
  styles: Style[]
  selectedId: string | null
  droppedId: string | null
  onPlay: (band: Band) => void
  onOpen: (band: Band) => void
}

/**
 * Construit la liste de nœuds React Flow : une carte volante par groupe.
 * Plus de clusters — placement libre sur le canvas. La couleur de la carte
 * vient du 1er style du groupe.
 */
export function buildNodes({ bands, styles, selectedId, droppedId, onPlay, onOpen }: BuildArgs): Node[] {
  const styleById = new Map(styles.map((s) => [s.id, s]))
  let autoOrder = 0

  return bands.map((band) => {
    const style = styleById.get(band.styles[0]) ?? FALLBACK_STYLE
    const hasPos = band.position && (band.position.x !== 0 || band.position.y !== 0)
    const position = hasPos ? band.position : autoPosition(autoOrder++)
    return {
      id: band.id,
      type: 'band',
      position,
      data: {
        band,
        style,
        selected: band.id === selectedId,
        dropped: band.id === droppedId,
        onPlay,
        onOpen,
      },
    }
  })
}
