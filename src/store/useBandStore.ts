import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Band, BandDatabase, Position, Style } from '../types'
import {
  applyPositions,
  clearDraft,
  clearPositions,
  contentSignature,
  loadDraft,
  loadPositions,
  type PositionMap,
  savePositions,
  saveDraft,
} from './persistence'

const DATA_URL = `${import.meta.env.BASE_URL}data/bands.json`

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `band-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}

export interface BandStore {
  loading: boolean
  error: string | null
  /** Données affichées : contenu (serveur, ou brouillon en édition) + positions locales. */
  styles: Style[]
  bands: Band[]

  editMode: boolean
  setEditMode: (b: boolean) => void

  /** Un brouillon de contenu local existe et diffère du serveur. */
  draftDiffers: boolean

  // Édition de contenu (n'a de sens qu'en mode édition ; écrit dans le brouillon).
  upsertBand: (band: Band) => void
  deleteBand: (id: string) => void
  addStyle: (style: Style) => void
  updateStyle: (id: string, patch: Partial<Omit<Style, 'id'>>) => void
  deleteStyle: (id: string) => void

  // Positions : priorité locale, toujours sauvegardées (lecture comme édition).
  moveBand: (id: string, position: Position) => void
  resetPositions: () => void

  // Synchronisation.
  exportJson: () => void
  importDatabase: (db: BandDatabase) => void
  /** Jette le brouillon de contenu local → retour à la version serveur. */
  discardDraft: () => void
}

export function useBandStore(): BandStore {
  const [server, setServer] = useState<BandDatabase | null>(null)
  const [draft, setDraft] = useState<BandDatabase | null>(null)
  const [positions, setPositions] = useState<PositionMap>({})
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Chargement initial : serveur (anti-cache) + couches locales.
  useEffect(() => {
    let cancelled = false
    setPositions(loadPositions())
    fetch(`${DATA_URL}?_=${Date.now()}`, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<BandDatabase>
      })
      .then((srv) => {
        if (cancelled) return
        setServer(srv)
        // Le brouillon redevient inutile s'il est identique au serveur (post-commit).
        const d = loadDraft()
        if (d && contentSignature(d) === contentSignature(srv)) {
          clearDraft()
          setDraft(null)
        } else {
          setDraft(d)
        }
      })
      .catch((e) => {
        if (!cancelled) setError(String(e))
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Contenu de référence affiché : brouillon en édition, sinon serveur.
  const content = editMode ? draft ?? server : server

  const draftDiffers = useMemo(
    () => !!(draft && server && contentSignature(draft) !== contentSignature(server)),
    [draft, server],
  )

  // Applique une mutation de contenu sur le brouillon (créé depuis le serveur au besoin).
  const editContent = useCallback(
    (mutate: (d: BandDatabase) => BandDatabase) => {
      setDraft((cur) => {
        const base = cur ?? (server ? structuredClone(server) : null)
        if (!base) return cur
        const next = mutate(base)
        saveDraft(next)
        return next
      })
    },
    [server],
  )

  const upsertBand = useCallback(
    (band: Band) =>
      editContent((d) => {
        const exists = d.bands.some((b) => b.id === band.id)
        return {
          ...d,
          bands: exists ? d.bands.map((b) => (b.id === band.id ? band : b)) : [...d.bands, band],
        }
      }),
    [editContent],
  )

  const deleteBand = useCallback(
    (id: string) => {
      editContent((d) => ({ ...d, bands: d.bands.filter((b) => b.id !== id) }))
      setPositions((cur) => {
        if (!cur[id]) return cur
        const next = { ...cur }
        delete next[id]
        savePositions(next)
        return next
      })
    },
    [editContent],
  )

  const addStyle = useCallback(
    (style: Style) =>
      editContent((d) =>
        d.styles.some((s) => s.id === style.id) ? d : { ...d, styles: [...d.styles, style] },
      ),
    [editContent],
  )

  const updateStyle = useCallback(
    (id: string, patch: Partial<Omit<Style, 'id'>>) =>
      editContent((d) => ({
        ...d,
        styles: d.styles.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      })),
    [editContent],
  )

  const deleteStyle = useCallback(
    (id: string) =>
      editContent((d) => ({
        ...d,
        styles: d.styles.filter((s) => s.id !== id),
        bands: d.bands.map((b) =>
          b.styles.includes(id) ? { ...b, styles: b.styles.filter((x) => x !== id) } : b,
        ),
      })),
    [editContent],
  )

  // Positions : priorité locale, indépendantes du brouillon de contenu.
  const moveBand = useCallback((id: string, position: Position) => {
    setPositions((cur) => {
      const next = { ...cur, [id]: position }
      savePositions(next)
      return next
    })
  }, [])

  const resetPositions = useCallback(() => {
    clearPositions()
    setPositions({})
  }, [])

  const exportJson = useCallback(() => {
    const base = draft ?? server
    if (!base) return
    // Export = contenu courant + positions locales fusionnées (pour committer le layout).
    const payload = applyPositions(base, positions)
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bands.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [draft, server, positions])

  const importDatabase = useCallback((imported: BandDatabase) => {
    setDraft(imported)
    saveDraft(imported)
    setEditMode(true)
  }, [])

  const discardDraft = useCallback(() => {
    clearDraft()
    setDraft(null)
  }, [])

  const display = useMemo(
    () => (content ? applyPositions(content, positions) : null),
    [content, positions],
  )

  return useMemo(
    () => ({
      loading: server === null && error === null,
      error,
      styles: display?.styles ?? [],
      bands: display?.bands ?? [],
      editMode,
      setEditMode,
      draftDiffers,
      upsertBand,
      deleteBand,
      addStyle,
      updateStyle,
      deleteStyle,
      moveBand,
      resetPositions,
      exportJson,
      importDatabase,
      discardDraft,
    }),
    [
      server,
      error,
      display,
      editMode,
      draftDiffers,
      upsertBand,
      deleteBand,
      addStyle,
      updateStyle,
      deleteStyle,
      moveBand,
      resetPositions,
      exportJson,
      importDatabase,
      discardDraft,
    ],
  )
}
