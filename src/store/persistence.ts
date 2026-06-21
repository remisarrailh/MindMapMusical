import type { BandDatabase, Position } from '../types'

// Deux couches locales SÉPARÉES :
//  - positions : prioritaire en local, toujours appliquée par-dessus le serveur.
//  - contentDraft : brouillon de contenu (édition non encore exportée). Le serveur
//    reste prioritaire pour l'affichage par défaut ; le brouillon ne sert qu'en
//    mode édition, et déclenche un avertissement tant qu'il diffère du serveur.
const POSITIONS_KEY = 'mindmap.positions'
const DRAFT_KEY = 'mindmap.contentDraft'

export type PositionMap = Record<string, Position>

export function loadPositions(): PositionMap {
  try {
    const raw = localStorage.getItem(POSITIONS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function savePositions(p: PositionMap): void {
  localStorage.setItem(POSITIONS_KEY, JSON.stringify(p))
}

export function clearPositions(): void {
  localStorage.removeItem(POSITIONS_KEY)
}

export function loadDraft(): BandDatabase | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const d = JSON.parse(raw)
    if (!Array.isArray(d.bands) || !Array.isArray(d.styles)) return null
    return d
  } catch {
    return null
  }
}

export function saveDraft(db: BandDatabase): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(db))
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY)
}

/** Applique les positions locales par-dessus une base (positions = priorité locale). */
export function applyPositions(db: BandDatabase, pos: PositionMap): BandDatabase {
  return {
    ...db,
    bands: db.bands.map((b) => (pos[b.id] ? { ...b, position: pos[b.id] } : b)),
  }
}

/** Signature du contenu en IGNORANT les positions (pour comparer brouillon vs serveur). */
export function contentSignature(db: BandDatabase): string {
  const bands = db.bands
    .map(({ position: _pos, ...rest }) => rest)
    .sort((a, b) => a.id.localeCompare(b.id))
  const styles = [...db.styles].sort((a, b) => a.id.localeCompare(b.id))
  return JSON.stringify({ bands, styles })
}
