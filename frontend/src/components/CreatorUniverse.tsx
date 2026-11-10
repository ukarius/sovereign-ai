import React, { useState, useCallback, useRef } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
  Handle,
  Position,
  Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'
import { X, PlayCircle, Clock, Plus, Video, Target, Trash2 } from 'lucide-react'

const calculateScrubberEffect = (val: number, dateRatio: number) => Math.floor(val * dateRatio)

// --- Custom Nodes ---
const EditableNodeWrapper = ({ id, data, children, className }: any) => {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label)
  const { setNodes, setEdges } = useReactFlow()

  const onBlur = () => {
    setIsEditing(false)
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n))
    )
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur()
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNodes((nds) => nds.filter((n) => n.id !== id))
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }

  return (
    <div 
      className={`group relative rounded-xl border ${className}`}
      onDoubleClick={() => setIsEditing(true)}
    >
      <button 
        onClick={handleDelete}
        className="absolute -top-3 -right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 text-red-500 border border-red-500/20 rounded-full p-1.5 backdrop-blur-md hover:bg-red-500/20"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-white border-2 border-slate-200" />
      
      {isEditing ? (
        <div className="p-3">
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className="bg-transparent border-b border-slate-2000 text-slate-900 text-center outline-none w-full font-bold"
          />
        </div>
      ) : (
        children(label, data)
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-white border-2 border-slate-200" />
    </div>
  )
}

const PillarNode = ({ id, data }: any) => (
  <EditableNodeWrapper id={id} data={data} className="bg-indigo-500 text-slate-900 font-bold px-6 py-3 border-transparent shadow-[0_0_20px_rgba(99,102,241,0.4)]">
    {(label: string) => <div className="text-center">{label}</div>}
  </EditableNodeWrapper>
)

const VideoNode = ({ id, data }: any) => (
  <EditableNodeWrapper id={id} data={data} className="bg-slate-50 text-slate-900 border-indigo-500/30 w-48 shadow-lg">
    {(label: string, d: any) => (
      <div className="p-3 flex flex-col items-center">
        <Video className="w-4 h-4 text-indigo-400 mb-2" />
        <div className="text-sm font-bold text-center mb-2">{label}</div>
        {d.views !== undefined && (
          <div className="w-full pt-2 border-t border-slate-200 flex justify-between text-[10px] text-slate-600">
            <span>{d.views} views</span>
            <span>{d.ctr}</span>
          </div>
        )}
      </div>
    )}
  </EditableNodeWrapper>
)

const SponsorNode = ({ id, data }: any) => (
  <EditableNodeWrapper id={id} data={data} className="bg-slate-50 text-slate-900 border-emerald-500/30 w-48 shadow-lg">
    {(label: string) => (
      <div className="p-3 flex flex-col items-center">
        <Target className="w-4 h-4 text-emerald-400 mb-2" />
        <div className="text-sm font-bold text-center text-emerald-100">{label}</div>
      </div>
    )}
  </EditableNodeWrapper>
)

const nodeTypes = {
  pillarNode: PillarNode,
  videoNode: VideoNode,
  sponsorNode: SponsorNode,
}

// --- Main Flow Component ---
function UniverseFlow() {
  const [timelineRatio, setTimelineRatio] = useState(1)
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()

  const initialNodes: Node[] = [
    { id: '1', type: 'pillarNode', position: { x: 400, y: 100 }, data: { label: 'Tech Reviews' } },
    { id: '2', type: 'videoNode', position: { x: 200, y: 300 }, data: { label: 'iPhone 15 Pro Max', views: 1200000, watchTime: '12m 4s', ctr: '8.4%' } },
    { id: '3', type: 'videoNode', position: { x: 600, y: 300 }, data: { label: 'M3 MacBook Pro', views: 850000, watchTime: '18m 12s', ctr: '11.2%' } },
  ]

  const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
  ]

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } }, eds)),
    [setEdges]
  )

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (node.type === 'videoNode' && node.data.views !== undefined) {
      setSelectedVideo(node.data)
    } else {
      setSelectedVideo(null)
    }
  }

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow')
      if (typeof type === 'undefined' || !type) return

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `node_${new Date().getTime()}`,
        type,
        position,
        data: { label: type === 'pillarNode' ? 'New Pillar' : type === 'sponsorNode' ? 'Brand Deal' : 'Draft Video' },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [screenToFlowPosition, setNodes]
  )

  return (
    <div className="w-full relative h-[70vh] rounded-2xl overflow-hidden glass-card" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={() => setSelectedVideo(null)}
        nodeTypes={nodeTypes}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
      >
        <Background color="#373A40" gap={16} size={1} />
        <Controls className="bg-white border-slate-300 fill-white" />
        <MiniMap 
          style={{ background: '#101113' }}
          nodeColor={(node) => {
            if (node.type === 'pillarNode') return '#6366f1'
            if (node.type === 'sponsorNode') return '#10b981'
            return '#1A1B1E'
          }}
          maskColor="rgba(26, 27, 30, 0.8)"
        />
      </ReactFlow>

      {/* Floating Panel for Video Analytics */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="absolute top-6 right-6 w-80 glass-card p-6 z-40"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-sovereign-400" />
                <h3 className="text-slate-900 font-bold max-w-[200px] truncate">{selectedVideo.label}</h3>
              </div>
              <button onClick={() => setSelectedVideo(null)} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-200/50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-white/10">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Views</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {calculateScrubberEffect(selectedVideo.views, timelineRatio).toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-200/50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-white/10">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Click-Through</div>
                  <div className="text-lg font-bold text-emerald-400">{selectedVideo.ctr}</div>
                </div>
                <div className="bg-slate-200/50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-white/10">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg. Watch</div>
                  <div className="text-lg font-bold text-accent-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedVideo.watchTime}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline Scrubber */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-[80%] max-w-2xl glass-card p-4 flex items-center gap-4 z-40">
        <span className="text-xs text-slate-700 font-medium w-16">Past</span>
        <input 
          type="range" 
          className="flex-1 w-full h-2 bg-slate-200 rounded-full appearance-none cursor-ew-resize accent-sovereign-500 hover:accent-sovereign-400 transition-all"
          min="0.1" 
          max="1.0" 
          step="0.01" 
          value={timelineRatio}
          onChange={(e) => setTimelineRatio(parseFloat(e.target.value))}
        />
        <span className="text-xs text-sovereign-400 font-bold w-16 text-right">Present</span>
      </div>

      {/* Strategy Toolbox */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex gap-4 px-6 py-3 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full shadow-2xl">
        <div 
          draggable 
          onDragStart={(e) => { e.dataTransfer.setData('application/reactflow', 'pillarNode'); e.dataTransfer.effectAllowed = 'move'; }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-full cursor-grab active:cursor-grabbing hover:bg-indigo-500/30 transition-colors text-sm font-bold border border-indigo-500/30"
        >
          <Plus className="w-4 h-4" /> Pillar
        </div>
        <div 
          draggable 
          onDragStart={(e) => { e.dataTransfer.setData('application/reactflow', 'videoNode'); e.dataTransfer.effectAllowed = 'move'; }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-full cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors text-sm font-bold border border-slate-200"
        >
          <Plus className="w-4 h-4 text-slate-600" /> Draft Video
        </div>
        <div 
          draggable 
          onDragStart={(e) => { e.dataTransfer.setData('application/reactflow', 'sponsorNode'); e.dataTransfer.effectAllowed = 'move'; }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full cursor-grab active:cursor-grabbing hover:bg-emerald-500/30 transition-colors text-sm font-bold border border-emerald-500/30"
        >
          <Plus className="w-4 h-4" /> Sponsor Slot
        </div>
      </div>
    </div>
  )
}

export default function CreatorUniverse() {
  return (
    <ReactFlowProvider>
      <UniverseFlow />
    </ReactFlowProvider>
  )
}
