import { Canvas } from "@react-three/fiber";
import { OrbitControls, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { Suspense } from "react";

const TestCanvas = () => {
  return (
    <div className="h-[400px] w-full rounded-luxe border border-line bg-card shadow-float overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          <Sphere args={[1, 100, 200]} scale={1.5}>
            <MeshDistortMaterial
              color="#211813"
              attach="material"
              distort={0.4}
              speed={2}
              roughness={0.2}
              metalness={0.8}
            />
          </Sphere>
          
          <OrbitControls enableZoom={false} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default TestCanvas;
