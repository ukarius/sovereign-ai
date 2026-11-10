import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line, Sphere, Cylinder, Icosahedron, Box, MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

const STAGES = [
  { id: 0, title: "Creator Data", pos: new THREE.Vector3(-6, 0, 0), cam: new THREE.Vector3(-6, 1, 6) },
  { id: 1, title: "AI Engine", pos: new THREE.Vector3(0, 2, -4), cam: new THREE.Vector3(0, 2, 4) },
  { id: 2, title: "Brand Deals", pos: new THREE.Vector3(6, -1, 0), cam: new THREE.Vector3(6, 0, 6) }
]

function CameraRig({ activeStage }: { activeStage: number }) {
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((state) => {
    const target = STAGES[activeStage]
    state.camera.position.lerp(target.cam, 0.04)
    lookAtTarget.current.lerp(target.pos, 0.04)
    state.camera.lookAt(lookAtTarget.current)
  })
  
  return null
}

function DataParticle({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const ref = useRef<THREE.Mesh>(null!)
  const progress = useRef(Math.random())
  const speed = Math.random() * 0.002 + 0.001

  useFrame(() => {
    if (!ref.current) return
    progress.current += speed
    if (progress.current > 1) progress.current = 0
    
    const position = curve.getPoint(progress.current)
    ref.current.position.copy(position)
  })

  return (
    <Sphere ref={ref} args={[0.08, 16, 16]}>
      <meshBasicMaterial color="#c084fc" transparent opacity={0.8} />
    </Sphere>
  )
}

function DataPipes() {
  const curve1 = useMemo(() => new THREE.CatmullRomCurve3([
    STAGES[0].pos,
    new THREE.Vector3(-3, 1, -2),
    STAGES[1].pos
  ]), [])

  const curve2 = useMemo(() => new THREE.CatmullRomCurve3([
    STAGES[1].pos,
    new THREE.Vector3(3, 0.5, -2),
    STAGES[2].pos
  ]), [])

  return (
    <group>
      {/* Pipe 1 */}
      <Line points={curve1.getPoints(50)} color="#4c1d95" lineWidth={2} transparent opacity={0.3} />
      {Array.from({ length: 8 }).map((_, i) => <DataParticle key={`p1-${i}`} curve={curve1} />)}
      
      {/* Pipe 2 */}
      <Line points={curve2.getPoints(50)} color="#4c1d95" lineWidth={2} transparent opacity={0.3} />
      {Array.from({ length: 8 }).map((_, i) => <DataParticle key={`p2-${i}`} curve={curve2} />)}
    </group>
  )
}

function CreatorDataStation() {
  return (
    <group position={[-6, 0, 0]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Cylinder args={[0.8, 0.8, 0.4, 32]} position={[0, -0.6, 0]}>
          <meshStandardMaterial color="#3b82f6" wireframe opacity={0.5} transparent />
        </Cylinder>
        <Cylinder args={[0.8, 0.8, 0.4, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#3b82f6" wireframe opacity={0.5} transparent />
        </Cylinder>
        <Cylinder args={[0.8, 0.8, 0.4, 32]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color="#3b82f6" wireframe opacity={0.5} transparent />
        </Cylinder>
        
        {/* Core */}
        <Cylinder args={[0.3, 0.3, 2, 32]}>
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.8} />
        </Cylinder>
      </Float>
    </group>
  )
}

function AIEngineStation() {
  const ref = useRef<THREE.Mesh>(null!)
  
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.2
      ref.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group position={[0, 2, -4]}>
      <Float speed={3} rotationIntensity={1} floatIntensity={1}>
        <Icosahedron ref={ref} args={[1.5, 0]}>
          <MeshDistortMaterial color="#c084fc" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.2} speed={2} />
        </Icosahedron>
        {/* Outer wireframe shell */}
        <Icosahedron args={[2, 1]}>
          <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.1} />
        </Icosahedron>
      </Float>
    </group>
  )
}

function BrandDealsStation() {
  return (
    <group position={[6, -1, 0]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Box args={[1, 1, 1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#10b981" transparent opacity={0.7} />
        </Box>
        <Box args={[0.5, 0.5, 0.5]} position={[1.5, 1, 0.5]}>
          <meshStandardMaterial color="#34d399" wireframe transparent opacity={0.5} />
        </Box>
        <Box args={[0.6, 0.6, 0.6]} position={[-1, 1.2, -0.5]}>
          <meshStandardMaterial color="#34d399" wireframe transparent opacity={0.5} />
        </Box>
        <Box args={[0.4, 0.4, 0.4]} position={[0.5, -1.2, 1]}>
          <meshStandardMaterial color="#34d399" wireframe transparent opacity={0.5} />
        </Box>
        <Box args={[0.7, 0.7, 0.7]} position={[-1.2, -0.8, -1]}>
          <meshStandardMaterial color="#34d399" wireframe transparent opacity={0.5} />
        </Box>
        
        {/* Connection lines between boxes */}
        <Line points={[[0,0,0], [1.5,1,0.5]]} color="#059669" transparent opacity={0.4} />
        <Line points={[[0,0,0], [-1,1.2,-0.5]]} color="#059669" transparent opacity={0.4} />
        <Line points={[[0,0,0], [0.5,-1.2,1]]} color="#059669" transparent opacity={0.4} />
        <Line points={[[0,0,0], [-1.2,-0.8,-1]]} color="#059669" transparent opacity={0.4} />
      </Float>
    </group>
  )
}

export default function ArchitectureModel({ activeStage }: { activeStage: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c084fc" />
      
      <CameraRig activeStage={activeStage} />
      
      <CreatorDataStation />
      <AIEngineStation />
      <BrandDealsStation />
      
      <DataPipes />
    </>
  )
}
