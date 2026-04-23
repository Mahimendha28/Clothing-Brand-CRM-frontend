import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, MeshReflectorMaterial, Image as DreiImage, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function ModelCard({ url, position, delay }) {
  const mesh = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Advanced floating animation
    if (mesh.current) {
      mesh.current.position.z = position[2] + Math.sin(time * 0.4 + delay) * 0.8;
      mesh.current.position.y = position[1] + Math.cos(time * 0.8 + delay) * 0.2;
      mesh.current.rotation.y = Math.sin(time * 0.2 + delay) * 0.1;
    }
  });

  return (
    <group position={position} ref={mesh}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
         <DreiImage 
            url={url} 
            scale={[2.8, 4.2]} 
            transparent 
            opacity={1}
            side={THREE.DoubleSide}
         />
      </Float>
    </group>
  );
}

function RunwayContent() {
  const models = [
    { url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800", pos: [-3.5, 0.5, -4], d: 0 },
    { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800", pos: [0, 0.8, -1], d: 2 },
    { url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800", pos: [3.5, 0.5, -6], d: 4 },
  ];

  return (
    <>
      {/* Lights - SIGNIFICANTLY Tasked for visibility */}
      <Environment preset="studio" />
      <ambientLight intensity={0.8} />
      <spotLight position={[10, 20, 10]} angle={0.5} penumbra={1} intensity={3} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={1} color="pink" />
      
      <Suspense fallback={null}>
        {models.map((m, i) => (
          <ModelCard key={i} url={m.url} position={m.pos} delay={m.d} />
        ))}
      </Suspense>

      {/* Runway Floor with High Reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={512}
          mixBlur={1}
          mixStrength={50}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#101010"
          metalness={0.5}
        />
      </mesh>

      <ContactShadows position={[0, -2.48, 0]} opacity={0.75} scale={20} blur={2.5} far={4.5} />
    </>
  );
}

export default function FashionRunway3D() {
  return (
    <div className="w-full h-[750px] bg-[#0a0a0a] relative overflow-hidden rounded-[4rem] my-24 shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/5">
      {/* HTML Overlay Content */}
      <div className="absolute top-16 left-0 right-0 z-20 text-center pointer-events-none px-6">
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 1 }}
         >
            <span className="text-[var(--color-primary)] font-black text-[11px] uppercase tracking-[0.6em] mb-4 block">Spring Summer Atelier 2024</span>
            <h2 className="text-white text-5xl md:text-7xl font-black uppercase tracking-tightest leading-none mb-6">THE RUNWAY <br/><span className="text-stroke-white text-transparent italic">EXPERIENCE</span></h2>
            <p className="text-white/30 text-xs font-bold uppercase tracking-[0.3em] max-w-sm mx-auto leading-relaxed">Interact with the models. Swipe to explore the motion of elite style.</p>
         </motion.div>
      </div>
      
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 40 }} 
        shadows 
        dpr={[1, 1.5]}
        gl={{ 
          antialias: false, 
          alpha: false, 
          stencil: false,
          depth: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: true
        }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <RunwayContent />
      </Canvas>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none z-10" />
      
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20">
         <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-14 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[var(--color-primary)] hover:text-white transition-all rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
         >
            Acquire Private Look
         </motion.button>
      </div>
    </div>
  );
}
