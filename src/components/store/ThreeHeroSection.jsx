import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, PresentationControls, ContactShadows, Image as DreiImage } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { landingContent } from '../../data/themeContent';

function RotatingClothingCards() {
  const groupRef = useRef();

  // Simple auto-rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.25;
    }
  });

  // Extract a few clothing images from our content
  const clothingImages = [
    landingContent?.hero?.image || "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
    ...(landingContent?.featureStories?.map(s => s.image) || [])
  ].slice(0, 4);

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={1}>
      <group ref={groupRef} position={[0, 0.5, 0]}>
        {clothingImages.map((src, index) => {
          const angle = (index / clothingImages.length) * Math.PI * 2;
          const radius = 2.4;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          return (
            <group key={index} position={[x, 0, z]} rotation={[0, angle, 0]}>
              <DreiImage
                url={src}
                scale={[2.2, 3.2]}
                transparent
                opacity={1}
                toneMapped={false}
              />
              {/* Add a subtle dark backing for depth */}
              <mesh position={[0, 0, -0.05]}>
                <planeGeometry args={[2.3, 3.3]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          );
        })}
      </group>
    </Float>
  );
}

// Rig for mouse parallax movement
function Rig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * 2.5 - camera.position.x) * 0.05;
    camera.position.y += (-pointer.y * 1 - camera.position.y) * 0.05;
    camera.lookAt(0, 1, 0);
  });
  return null;
}

export default function ThreeHeroSection() {
  return (
    <section className="relative w-full h-[80vh] min-h-[600px] bg-white overflow-hidden flex flex-col md:flex-row items-center border-b border-gray-100">
      
      {/* 3D Canvas Background / Right Side */}
      <div className="absolute inset-0 md:relative md:w-1/2 h-full z-0 pointer-events-none md:pointer-events-auto opacity-70 md:opacity-100">
        <Canvas camera={{ position: [0, 1, 7], fov: 45 }}>
          <Environment preset="city" />
          <ambientLight intensity={1} />
          
          <PresentationControls 
            global 
            config={{ mass: 1, tension: 170, friction: 26 }} 
            snap={{ mass: 2, tension: 200 }} 
            rotation={[0, 0.2, 0]} 
            polar={[-Math.PI / 6, Math.PI / 6]} 
            azimuth={[-Math.PI / 2, Math.PI / 2]}
          >
            <RotatingClothingCards />
          </PresentationControls>
          
          <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={15} blur={2.5} far={4} />
          <Rig />
        </Canvas>
      </div>

      {/* Left: Text Content */}
      <div className="relative z-10 w-full md:w-1/2 px-8 lg:px-16 flex flex-col items-center md:items-start text-center md:text-left justify-center h-full bg-white/80 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black mb-6 inline-block">
            Virtual Showroom
          </span>
          <h2 className="text-4xl lg:text-6xl font-black text-black leading-[1.0] tracking-widest uppercase mb-6">
            Interact. <br/><span className="text-gray-400">Discover.</span>
          </h2>
          <p className="text-gray-500 text-sm lg:text-base max-w-sm leading-relaxed mb-10 tracking-wide font-medium">
            Swipe and drag the collection pieces to explore our ultra-premium modern streetwear through a digital lens.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
             <Link to="/products" className="w-full sm:w-auto px-10 py-4 bg-black text-white hover:bg-gray-900 border border-black font-bold uppercase tracking-[0.15em] text-xs transition-colors flex items-center justify-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5" /> Shop Collection
             </Link>
             <Link to="/products?sort=new" className="w-full sm:w-auto px-10 py-4 bg-transparent text-black border border-black hover:bg-gray-50 font-bold uppercase tracking-[0.15em] text-xs transition-colors flex items-center justify-center gap-2">
                View Lookbook <ArrowRight className="w-3.5 h-3.5" />
             </Link>
          </div>
        </motion.div>
      </div>
      
    </section>
  );
}
