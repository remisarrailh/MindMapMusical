import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  type Node,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { Band, BandDatabase } from './types'
import { useBandStore } from './store/useBandStore'
import { buildNodes } from './map/layout'
import BandNode from './map/BandNode'
import Toolbar from './ui/Toolbar'
import BandDetailPanel from './ui/BandDetailPanel'
import BandForm from './ui/BandForm'
import StyleManager from './ui/StyleManager'

const nodeTypes = { band: BandNode }

export default function App() {
  const store = useBandStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [initialVideo, setInitialVideo] = useState<number | null>(null)
  const [editing, setEditing] = useState<Band | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showStyles, setShowStyles] = useState(false)
  const [search, setSearch] = useState('')
  const [styleFilter, setStyleFilter] = useState<string | null>(null)
  const [droppedId, setDroppedId] = useState<string | null>(null)

  // Le groupe sélectionné est résolu par id depuis les données courantes
  // (reste synchro avec le mode lecture/édition et les éditions).
  const selected = selectedId ? store.bands.find((b) => b.id === selectedId) ?? null : null

  const openDetail = useCallback((band: Band) => {
    setSelectedId(band.id)
    setInitialVideo(null)
  }, [])

  const playBand = useCallback((band: Band) => {
    setSelectedId(band.id)
    setInitialVideo(0)
  }, [])

  // Filtrage recherche + style.
  const visibleBands = useMemo(() => {
    const q = search.trim().toLowerCase()
    return store.bands.filter((b) => {
      if (styleFilter && !b.styles.includes(styleFilter)) return false
      if (q && !b.name.toLowerCase().includes(q) && !b.info.toLowerCase().includes(q)) return false
      return true
    })
  }, [store.bands, search, styleFilter])

  // React Flow doit posséder l'état des nœuds (mode contrôlé via onNodesChange)
  // pour que la carte suive le curseur pendant le drag.
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>([])

  // Reconstruit les nœuds quand les données sous-jacentes changent (hors drag).
  useEffect(() => {
    setRfNodes(
      buildNodes({
        bands: visibleBands,
        styles: store.styles,
        selectedId: selected?.id ?? null,
        droppedId,
        onPlay: playBand,
        onOpen: openDetail,
      }),
    )
  }, [visibleBands, store.styles, selected, droppedId, playBand, openDetail, setRfNodes])

  // Sauvegarde de la position après un drag + déclenche l'animation de "pose".
  const onNodeDragStop = useCallback(
    (_e: unknown, node: Node) => {
      store.moveBand(node.id, { x: node.position.x, y: node.position.y })
      setDroppedId(node.id)
      window.setTimeout(() => setDroppedId((cur) => (cur === node.id ? null : cur)), 360)
    },
    [store],
  )

  const onNodeClick: NodeMouseHandler = useCallback((_e, node) => {
    if (node.type === 'band') {
      const band = (node.data as { band: Band }).band
      openDetail(band)
    }
  }, [openDetail])

  const handleSave = (band: Band) => {
    store.upsertBand(band)
    setShowForm(false)
    setEditing(null)
    setSelectedId(band.id)
    setInitialVideo(null)
  }

  const handleDelete = (band: Band) => {
    if (!confirm(`Supprimer « ${band.name} » ?`)) return
    store.deleteBand(band.id)
    setSelectedId(null)
  }

  const handleImport = (db: BandDatabase) => {
    store.importDatabase(db)
    setSelectedId(null)
  }

  const handleDiscard = () => {
    if (confirm('Jeter ton brouillon de contenu local et revenir à la version serveur ?')) {
      store.discardDraft()
      setSelectedId(null)
    }
  }

  const handleResetPositions = () => {
    if (confirm('Réinitialiser toutes les positions des cartes (selon la version serveur) ?')) {
      store.resetPositions()
    }
  }

  if (store.error) {
    return (
      <div className="fatal">
        <h1>Erreur de chargement</h1>
        <p>Impossible de charger <code>bands.json</code> : {store.error}</p>
      </div>
    )
  }

  return (
    <div className="app">
      <Toolbar
        styles={store.styles}
        search={search}
        onSearch={setSearch}
        styleFilter={styleFilter}
        onStyleFilter={setStyleFilter}
        editMode={store.editMode}
        onToggleEdit={() => store.setEditMode(!store.editMode)}
        onAdd={() => {
          setEditing(null)
          setShowForm(true)
        }}
        onManageStyles={() => setShowStyles(true)}
        onExport={store.exportJson}
        onImport={handleImport}
        onResetPositions={handleResetPositions}
        count={store.bands.length}
      />

      {store.draftDiffers && (
        <div className="draft-banner">
          <span>⚠️ Tu as des modifications de contenu locales <strong>non exportées</strong> (différentes du serveur).</span>
          <div className="draft-banner-actions">
            <button className="btn btn-sm btn-primary" onClick={store.exportJson}>⬇ Exporter</button>
            <button className="btn btn-sm" onClick={handleDiscard}>🗑 Jeter le brouillon</button>
          </div>
        </div>
      )}

      <div className="canvas">
        <ReactFlowProvider>
          <ReactFlow
            nodes={rfNodes}
            edges={[]}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onNodeDragStop={onNodeDragStop}
            onNodeClick={onNodeClick}
            onPaneClick={() => setSelectedId(null)}
            minZoom={0.1}
            maxZoom={2}
            fitView
            fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={24} />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </ReactFlowProvider>

        {selected && !showForm && (
          <BandDetailPanel
            band={selected}
            styles={store.styles}
            initialVideo={initialVideo}
            editable={store.editMode}
            onEdit={(b) => {
              setEditing(b)
              setShowForm(true)
            }}
            onDelete={handleDelete}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      {store.loading && <div className="loading">Chargement…</div>}

      {showForm && (
        <BandForm
          band={editing}
          styles={store.styles}
          onSave={handleSave}
          onAddStyle={store.addStyle}
          onClose={() => {
            setShowForm(false)
            setEditing(null)
          }}
        />
      )}

      {showStyles && (
        <StyleManager
          styles={store.styles}
          bands={store.bands}
          onUpdate={store.updateStyle}
          onDelete={store.deleteStyle}
          onAdd={store.addStyle}
          onClose={() => setShowStyles(false)}
        />
      )}
    </div>
  )
}
