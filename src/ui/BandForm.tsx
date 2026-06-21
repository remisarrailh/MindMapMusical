import { useState } from 'react'
import type { Band, Link, Style, Video } from '../types'
import { newId } from '../store/useBandStore'
import { parseYouTubeId } from '../youtube'

interface Props {
  /** Groupe à éditer, ou null pour une création. */
  band: Band | null
  styles: Style[]
  onSave: (band: Band) => void
  onAddStyle: (style: Style) => void
  onClose: () => void
}

function emptyBand(): Band {
  return {
    id: newId(),
    name: '',
    logo: '',
    styles: [],
    info: '',
    videos: [],
    links: [],
    concertsUrl: '',
    position: { x: 0, y: 0 },
  }
}

const PALETTE = ['#e63946', '#1d3557', '#f4a261', '#9b5de5', '#2a9d8f', '#e9c46a', '#06d6a0', '#ef476f']

export default function BandForm({ band, styles, onSave, onAddStyle, onClose }: Props) {
  const [draft, setDraft] = useState<Band>(() => (band ? structuredClone(band) : emptyBand()))
  const [newStyleLabel, setNewStyleLabel] = useState('')
  const [videoInput, setVideoInput] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [linkUrl, setLinkUrl] = useState('')

  const set = <K extends keyof Band>(key: K, value: Band[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const toggleStyle = (id: string) => {
    setDraft((d) => {
      const has = d.styles.includes(id)
      return { ...d, styles: has ? d.styles.filter((s) => s !== id) : [...d.styles, id] }
    })
  }

  const createStyle = () => {
    const label = newStyleLabel.trim()
    if (!label) return
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `style-${Date.now()}`
    if (styles.some((s) => s.id === id)) {
      toggleStyle(id)
      setNewStyleLabel('')
      return
    }
    const color = PALETTE[styles.length % PALETTE.length]
    onAddStyle({ id, label, color })
    setDraft((d) => ({ ...d, styles: [...d.styles, id] }))
    setNewStyleLabel('')
  }

  const onLogoFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('logo', String(reader.result))
    reader.readAsDataURL(file)
  }

  const addVideo = () => {
    const id = parseYouTubeId(videoInput)
    if (!id) {
      alert('URL ou ID YouTube non reconnu.')
      return
    }
    const v: Video = { title: videoTitle.trim(), youtubeId: id }
    set('videos', [...draft.videos, v])
    setVideoInput('')
    setVideoTitle('')
  }

  const removeVideo = (i: number) =>
    set('videos', draft.videos.filter((_, idx) => idx !== i))

  const addLink = () => {
    if (!linkUrl.trim()) return
    const l: Link = { label: linkLabel.trim(), url: linkUrl.trim() }
    set('links', [...draft.links, l])
    setLinkLabel('')
    setLinkUrl('')
  }

  const removeLink = (i: number) =>
    set('links', draft.links.filter((_, idx) => idx !== i))

  const submit = () => {
    if (!draft.name.trim()) {
      alert('Le nom du groupe est obligatoire.')
      return
    }
    onSave({ ...draft, name: draft.name.trim() })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{band ? 'Éditer le groupe' : 'Nouveau groupe'}</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <label className="field">
            <span>Nom *</span>
            <input value={draft.name} onChange={(e) => set('name', e.target.value)} autoFocus />
          </label>

          <label className="field">
            <span>Logo</span>
            <div className="logo-row">
              {draft.logo && <img className="logo-preview" src={draft.logo} alt="" />}
              <input type="file" accept="image/*" onChange={(e) => onLogoFile(e.target.files?.[0])} />
              {draft.logo && (
                <button type="button" className="link-btn" onClick={() => set('logo', '')}>
                  retirer
                </button>
              )}
            </div>
            <input
              className="logo-url"
              placeholder="…ou colle une URL d'image"
              value={draft.logo.startsWith('data:') ? '' : draft.logo}
              onChange={(e) => set('logo', e.target.value)}
            />
          </label>

          <div className="field">
            <span>Styles (le 1er coché = couleur de la carte)</span>
            <div className="style-picker">
              {styles.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  className={`style-chip${draft.styles.includes(s.id) ? ' style-chip--on' : ''}`}
                  style={{
                    borderColor: s.color,
                    background: draft.styles.includes(s.id) ? `${s.color}22` : undefined,
                  }}
                  onClick={() => toggleStyle(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="inline-add">
              <input
                placeholder="Nouveau style…"
                value={newStyleLabel}
                onChange={(e) => setNewStyleLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), createStyle())}
              />
              <button type="button" className="btn btn-sm" onClick={createStyle}>+ ajouter</button>
            </div>
          </div>

          <label className="field">
            <span>Infos (musiciens, détails…)</span>
            <textarea rows={4} value={draft.info} onChange={(e) => set('info', e.target.value)} />
          </label>

          <div className="field">
            <span>Vidéos YouTube</span>
            <ul className="chip-list">
              {draft.videos.map((v, i) => (
                <li key={i}>
                  <span>{v.title || v.youtubeId}</span>
                  <button type="button" className="icon-btn" onClick={() => removeVideo(i)}>✕</button>
                </li>
              ))}
            </ul>
            <div className="inline-add">
              <input
                placeholder="Titre (optionnel)"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
              />
              <input
                placeholder="URL ou ID YouTube"
                value={videoInput}
                onChange={(e) => setVideoInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVideo())}
              />
              <button type="button" className="btn btn-sm" onClick={addVideo}>+ </button>
            </div>
          </div>

          <div className="field">
            <span>Liens</span>
            <ul className="chip-list">
              {draft.links.map((l, i) => (
                <li key={i}>
                  <span>{l.label || l.url}</span>
                  <button type="button" className="icon-btn" onClick={() => removeLink(i)}>✕</button>
                </li>
              ))}
            </ul>
            <div className="inline-add">
              <input placeholder="Label" value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} />
              <input
                placeholder="https://…"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
              />
              <button type="button" className="btn btn-sm" onClick={addLink}>+ </button>
            </div>
          </div>

          <label className="field">
            <span>Lien dates de concerts</span>
            <input
              placeholder="https://…"
              value={draft.concertsUrl}
              onChange={(e) => set('concertsUrl', e.target.value)}
            />
          </label>
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={submit}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}
