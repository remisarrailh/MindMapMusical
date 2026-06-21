import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Band, BandDatabase, Position, Style } from '../types'
import {
  clearOverrides,
  hasUnexportedChanges,
  loadOverrides,
  markExported,
  mergeDatabase,
  saveOverrides,
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
  styles: Style[]
  bands: Band[]
  upsertBand: (band: Band) => void
  deleteBand: (id: string) => void
  moveBand: (id: string, position: Position) => void
  addStyle: (style: Style) => void
  updateStyle: (id: string, patch: Partial<Omit<Style, 'id'>>) => void
  /** Supprime un style et le retire des groupes qui le référencent. */
  deleteStyle: (id: string) => void
  /** Télécharge le JSON fusionné complet (à committer sur GitHub). */
  exportJson: () => void
  /** Réinjecte un fichier bands.json importé. */
  importDatabase: (db: BandDatabase) => void
  /** Vide la couche localStorage (après commit du JSON exporté). */
  resetLocal: () => void
  hasUnexported: boolean
}

export function useBandStore(): BandStore {
  const [base, setBase] = useState<BandDatabase | null>(null)
  const [db, setDb] = useState<BandDatabase | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasUnexported, setHasUnexported] = useState(false)

  // Chargement initial : JSON committé + merge overrides locaux.
  useEffect(() => {
    let cancelled = false
    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<BandDatabase>
      })
      .then((baseDb) => {
        if (cancelled) return
        setBase(baseDb)
        const merged = mergeDatabase(baseDb, loadOverrides())
        setDb(merged)
        setHasUnexported(hasUnexportedChanges())
      })
      .catch((e) => {
        if (!cancelled) setError(String(e))
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Persiste toute mutation dans le localStorage.
  const commit = useCallback((next: BandDatabase) => {
    setDb(next)
    saveOverrides({ bands: next.bands, styles: next.styles })
    setHasUnexported(true)
  }, [])

  const upsertBand = useCallback(
    (band: Band) => {
      setDb((cur) => {
        if (!cur) return cur
        const exists = cur.bands.some((b) => b.id === band.id)
        const bands = exists
          ? cur.bands.map((b) => (b.id === band.id ? band : b))
          : [...cur.bands, band]
        const next = { ...cur, bands }
        saveOverrides({ bands: next.bands, styles: next.styles })
        setHasUnexported(true)
        return next
      })
    },
    [],
  )

  const deleteBand = useCallback((id: string) => {
    setDb((cur) => {
      if (!cur) return cur
      const next = { ...cur, bands: cur.bands.filter((b) => b.id !== id) }
      saveOverrides({ bands: next.bands, styles: next.styles })
      setHasUnexported(true)
      return next
    })
  }, [])

  const moveBand = useCallback((id: string, position: Position) => {
    setDb((cur) => {
      if (!cur) return cur
      const next = {
        ...cur,
        bands: cur.bands.map((b) => (b.id === id ? { ...b, position } : b)),
      }
      saveOverrides({ bands: next.bands, styles: next.styles })
      setHasUnexported(true)
      return next
    })
  }, [])

  const addStyle = useCallback((style: Style) => {
    setDb((cur) => {
      if (!cur) return cur
      if (cur.styles.some((s) => s.id === style.id)) return cur
      const next = { ...cur, styles: [...cur.styles, style] }
      saveOverrides({ bands: next.bands, styles: next.styles })
      setHasUnexported(true)
      return next
    })
  }, [])

  const updateStyle = useCallback((id: string, patch: Partial<Omit<Style, 'id'>>) => {
    setDb((cur) => {
      if (!cur) return cur
      const next = {
        ...cur,
        styles: cur.styles.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      }
      saveOverrides({ bands: next.bands, styles: next.styles })
      setHasUnexported(true)
      return next
    })
  }, [])

  const deleteStyle = useCallback((id: string) => {
    setDb((cur) => {
      if (!cur) return cur
      const next = {
        ...cur,
        styles: cur.styles.filter((s) => s.id !== id),
        bands: cur.bands.map((b) =>
          b.styles.includes(id) ? { ...b, styles: b.styles.filter((x) => x !== id) } : b,
        ),
      }
      saveOverrides({ bands: next.bands, styles: next.styles })
      setHasUnexported(true)
      return next
    })
  }, [])

  const exportJson = useCallback(() => {
    if (!db) return
    const payload: BandDatabase = {
      version: db.version,
      styles: db.styles,
      bands: db.bands,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bands.json'
    a.click()
    URL.revokeObjectURL(url)
    markExported()
    setHasUnexported(false)
  }, [db])

  const importDatabase = useCallback((imported: BandDatabase) => {
    commit(imported)
  }, [commit])

  const resetLocal = useCallback(() => {
    clearOverrides()
    if (base) setDb(base)
    setHasUnexported(false)
  }, [base])

  return useMemo(
    () => ({
      loading: db === null && error === null,
      error,
      styles: db?.styles ?? [],
      bands: db?.bands ?? [],
      upsertBand,
      deleteBand,
      moveBand,
      addStyle,
      updateStyle,
      deleteStyle,
      exportJson,
      importDatabase,
      resetLocal,
      hasUnexported,
    }),
    [db, error, upsertBand, deleteBand, moveBand, addStyle, updateStyle, deleteStyle, exportJson, importDatabase, resetLocal, hasUnexported],
  )
}
