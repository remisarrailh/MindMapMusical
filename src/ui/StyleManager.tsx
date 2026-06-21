import { useState } from 'react'
import type { Band, Style } from '../types'

interface Props {
  styles: Style[]
  bands: Band[]
  onUpdate: (id: string, patch: Partial<Omit<Style, 'id'>>) => void
  onDelete: (id: string) => void
  onAdd: (style: Style) => void
  onClose: () => void
}

const PALETTE = ['#e63946', '#1d3557', '#f4a261', '#9b5de5', '#2a9d8f', '#e9c46a', '#06d6a0', '#ef476f']

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function StyleManager({ styles, bands, onUpdate, onDelete, onAdd, onClose }: Props) {
  const [newLabel, setNewLabel] = useState('')
  const [newColor, setNewColor] = useState(PALETTE[0])

  const countFor = (id: string) => bands.filter((b) => b.styles.includes(id)).length

  const addStyle = () => {
    const label = newLabel.trim()
    if (!label) return
    const id = slugify(label) || `style-${styles.length + 1}`
    if (styles.some((s) => s.id === id)) {
      alert('Un style avec ce nom existe déjà.')
      return
    }
    onAdd({ id, label, color: newColor })
    setNewLabel('')
    setNewColor(PALETTE[(styles.length + 1) % PALETTE.length])
  }

  const removeStyle = (s: Style) => {
    const n = countFor(s.id)
    const msg = n
      ? `Supprimer le style « ${s.label} » ? ${n} groupe(s) le perdront (ils iront dans « Autres » s'ils n'ont plus de style).`
      : `Supprimer le style « ${s.label} » ?`
    if (confirm(msg)) onDelete(s.id)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Gérer les styles</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <ul className="style-manager-list">
            {styles.map((s) => (
              <li key={s.id} className="style-manager-row">
                <input
                  type="color"
                  className="color-input"
                  value={s.color}
                  onChange={(e) => onUpdate(s.id, { color: e.target.value })}
                  title="Couleur"
                />
                <input
                  className="style-label-input"
                  value={s.label}
                  onChange={(e) => onUpdate(s.id, { label: e.target.value })}
                />
                <span className="style-count" title="Groupes dans ce style">{countFor(s.id)}</span>
                <button className="icon-btn" onClick={() => removeStyle(s)} title="Supprimer">🗑</button>
              </li>
            ))}
            {styles.length === 0 && <li className="style-empty">Aucun style pour l'instant.</li>}
          </ul>

          <div className="field">
            <span>Nouveau style</span>
            <div className="style-manager-row">
              <input
                type="color"
                className="color-input"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
              />
              <input
                className="style-label-input"
                placeholder="Nom du style…"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStyle())}
              />
              <button className="btn btn-sm" onClick={addStyle}>+ ajouter</button>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}
