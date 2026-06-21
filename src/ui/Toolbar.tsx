import { useRef } from 'react'
import type { BandDatabase, Style } from '../types'

interface Props {
  styles: Style[]
  search: string
  onSearch: (s: string) => void
  styleFilter: string | null
  onStyleFilter: (id: string | null) => void
  editMode: boolean
  onToggleEdit: () => void
  onAdd: () => void
  onManageStyles: () => void
  onExport: () => void
  onImport: (db: BandDatabase) => void
  onResetPositions: () => void
  count: number
}

export default function Toolbar({
  styles,
  search,
  onSearch,
  styleFilter,
  onStyleFilter,
  editMode,
  onToggleEdit,
  onAdd,
  onManageStyles,
  onExport,
  onImport,
  onResetPositions,
  count,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const db = JSON.parse(String(reader.result)) as BandDatabase
        if (!Array.isArray(db.bands) || !Array.isArray(db.styles)) {
          throw new Error('format invalide')
        }
        onImport(db)
      } catch (e) {
        alert(`Import impossible : ${e}`)
      }
    }
    reader.readAsText(file)
  }

  return (
    <header className={`toolbar${editMode ? ' toolbar--edit' : ''}`}>
      <div className="toolbar-brand">
        🎸 <strong>MindMap Musical</strong>
        <span className="toolbar-sub">Montpellier · {count} groupes</span>
      </div>

      <div className="toolbar-controls">
        <input
          className="search"
          placeholder="Rechercher un groupe…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        <select
          className="style-filter"
          value={styleFilter ?? ''}
          onChange={(e) => onStyleFilter(e.target.value || null)}
        >
          <option value="">Tous les styles</option>
          {styles.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-actions">
        <button
          className={`btn${editMode ? ' btn-primary' : ''}`}
          onClick={onToggleEdit}
          title={editMode ? 'Quitter le mode édition' : 'Activer le mode édition'}
        >
          {editMode ? '✓ Terminer' : '✏️ Éditer'}
        </button>

        {editMode && (
          <>
            <button className="btn" onClick={onAdd}>+ Groupe</button>
            <button className="btn" onClick={onManageStyles} title="Gérer les styles et leurs couleurs">
              🎨 Styles
            </button>
            <button className="btn" onClick={onExport} title="Télécharger bands.json à committer">
              ⬇ Export
            </button>
            <button className="btn" onClick={() => fileRef.current?.click()} title="Charger un bands.json">
              ⬆ Import
            </button>
            <button className="btn" onClick={onResetPositions} title="Remettre les cartes aux positions du serveur">
              ⤺ Positions
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                handleFile(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </>
        )}
      </div>
    </header>
  )
}
