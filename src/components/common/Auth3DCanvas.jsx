import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, PerspectiveCamera } from "@react-three/drei";

function AbstractShapes() {
  const mesh1 = useRef();
  const mesh2 = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (mesh1.current) {
      mesh1.current.rotation.x = Math.cos(time / 4);
      mesh1.current.rotation.y = Math.sin(time / 2);
    }
    if (mesh2.current) {
      mesh2.current.rotation.x = Math.sin(time / 3);
      mesh2.current.rotation.y = Math.cos(time / 2);
    }
  });

  return (
    <>
      <Float speed={1.4} rotationIntensity={1} floatIntensity={2}>
        <Sphere ref={mesh1} args={[1, 64, 64]} position={[-2, 1, 0]}>
          <MeshDistortMaterial color="#6366F1" speed={3} distort={0.6} radius={1} />
        </Sphere>
      </Float>

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere ref={mesh2} args={[0.6, 64, 64]} position={[2, -1, 2]}>
          <MeshWobbleMaterial color="#000000" speed={1} factor={0.6} />
        </Sphere>
      </Float>

      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <ambientLight intensity={0.5} />
    </>
  );
}

export default function Auth3DCanvas() {
  return (
    <div className="absolute inset-0 z-0 bg-[#F8FAFC]">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <AbstractShapes />
      </Canvas>
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]"></div>
    </div>
  );
}
