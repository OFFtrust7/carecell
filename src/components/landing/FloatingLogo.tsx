import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Text } from "@react-three/drei";
import * as THREE from "three";

interface FloatingLogoProps {
  scrollProgress: number;
}

export default function FloatingLogo({ scrollProgress }: FloatingLogoProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ pointer, clock }) => {
    if (!groupRef.current) return;
    const time = clock.getElapsedTime();

    // Smooth mouse tracking
    const targetRotX = pointer.y * 0.15;
    const targetRotY = pointer.x * 0.2;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.y += (targetRotY + time * 0.1 - groupRef.current.rotation.y) * 0.05;

    // Scroll-driven position: move logo from center to upper-right
    const targetX = scrollProgress * 3;
    const targetY = scrollProgress * 1.5;
    const targetScale = 1 - scrollProgress * 0.4;

    groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.08;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.08;
    groupRef.current.scale.setScalar(
      groupRef.current.scale.x + (targetScale - groupRef.current.scale.x) * 0.08
    );
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Heart shape - two spheres merged */}
        <mesh position={[-0.35, 0.15, 0]}>
          <sphereGeometry args={[0.55, 64, 64]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={0.4}
            chromaticAberration={0.15}
            anisotropy={0.3}
            distortion={0.2}
            distortionScale={0.3}
            temporalDistortion={0.1}
            iridescence={1}
            iridescenceIOR={1.2}
            iridescenceThicknessRange={[100, 400]}
            color="#8A2BE2"
            transmission={0.95}
            roughness={0.05}
            ior={1.5}
          />
        </mesh>
        <mesh position={[0.35, 0.15, 0]}>
          <sphereGeometry args={[0.55, 64, 64]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={0.4}
            chromaticAberration={0.15}
            anisotropy={0.3}
            distortion={0.2}
            distortionScale={0.3}
            temporalDistortion={0.1}
            iridescence={1}
            iridescenceIOR={1.2}
            iridescenceThicknessRange={[100, 400]}
            color="#00CED1"
            transmission={0.95}
            roughness={0.05}
            ior={1.5}
          />
        </mesh>

        {/* Droplet bottom */}
        <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
          <coneGeometry args={[0.55, 0.9, 64]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={0.3}
            chromaticAberration={0.1}
            distortion={0.15}
            distortionScale={0.2}
            temporalDistortion={0.05}
            iridescence={1}
            iridescenceIOR={1.15}
            iridescenceThicknessRange={[100, 400]}
            color="#6B5CE7"
            transmission={0.95}
            roughness={0.05}
            ior={1.5}
          />
        </mesh>

        {/* Inner glow */}
        <pointLight position={[0, 0, 1]} intensity={2} color="#8A2BE2" distance={4} />
        <pointLight position={[0, 0, -1]} intensity={1} color="#00CED1" distance={3} />
      </group>
    </Float>
  );
}
