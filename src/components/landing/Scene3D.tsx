import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import ParticleField from "./ParticleField";
import FloatingLogo from "./FloatingLogo";

interface Scene3DProps {
  scrollProgress: number;
}

export default function Scene3D({ scrollProgress }: Scene3DProps) {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} color="#8A2BE2" />
          <directionalLight position={[-5, -3, 3]} intensity={0.3} color="#00CED1" />

          <ParticleField />
          <FloatingLogo scrollProgress={scrollProgress} />

          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}
