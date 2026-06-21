import type { Band, BandDatabase, Style } from '../types'

const STORAGE_KEY = 'mindmap.overrides'
const EXPORTED_FLAG = 'mindmap.exportedSinceLastEdit'

/**
 * Couche d'overrides stockée en localStorage, appliquée par-dessus le JSON committé.
 * On stocke l'état complet (bands + styles) pour simplifier l'export.
 */
export interface Overrides {
  bands: Band[]
  styles: Style[]
}

export function loadOverrides(): Overrides | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Overrides
    if (!Array.isArray(parsed.bands) || !Array.isArray(parsed.styles)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveOverrides(o: Overrides): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(o))
  localStorage.setItem(EXPORTED_FLAG, 'false')
}

export function clearOverrides(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(EXPORTED_FLAG)
}

export function hasOverrides(): boolean {
  return localStorage.getItem(STORAGE_KEY) != null
}

export function markExported(): void {
  localStorage.setItem(EXPORTED_FLAG, 'true')
}

/** true si des changements locaux n'ont pas encore été exportés. */
export function hasUnexportedChanges(): boolean {
  return hasOverrides() && localStorage.getItem(EXPORTED_FLAG) !== 'true'
}

/**
 * Fusionne la base (JSON committé) avec les overrides locaux.
 * Les overlays remplacent intégralement la base s'ils existent (l'overlay EST
 * l'état courant complet, écrit à chaque mutation).
 */
export function mergeDatabase(base: BandDatabase, overrides: Overrides | null): BandDatabase {
  if (!overrides) return base
  return {
    version: base.version,
    styles: overrides.styles,
    bands: overrides.bands,
  }
}
