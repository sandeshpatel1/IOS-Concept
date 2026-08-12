import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshDistortMaterial } from '@react-three/drei';

function GlassShape({ position, scale, geometry, color, speed = 1 }) {
  const ref = useRef();
  useFrame((state, delta) => {
    ref.current.rotation.x += delta * 0.08 * speed;
    ref.current.rotation.y += delta * 0.11 * speed;
  });
  return (
    <Float speed={1.4 * speed} rotationIntensity={0.5} floatIntensity={1.6}>
      <mesh ref={ref} position={position} scale={scale}>
        {geometry}
        <MeshDistortMaterial
          color={color}
          roughness={0.08}
          metalness={0.15}
          transmission={0.92}
          thickness={1.4}
          distort={0.22}
          speed={1.2}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

function Rig() {
  useFrame(({ mouse, camera }) => {
    camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.02;
    camera.position.y += (mouse.y * 0.4 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function GlassScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 42 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 5, 5]} intensity={1.4} color="#0a84ff" />
      <directionalLight position={[-4, -3, -4]} intensity={0.8} color="#bf5af2" />

      <Suspense fallback={null}>
        <GlassShape position={[1.8, 0.6, 0]}   scale={1.35} geometry={<icosahedronGeometry args={[1, 0]} />} color="#0a84ff" speed={1} />
        <GlassShape position={[-2, -0.4, -1.5]} scale={0.9}  geometry={<octahedronGeometry args={[1, 0]} />}  color="#bf5af2" speed={1.3} />
        <GlassShape position={[0.2, -1.4, -1]}  scale={0.65} geometry={<torusGeometry args={[1, 0.35, 16, 60]} />} color="#64d2ff" speed={0.8} />
        <GlassShape position={[-1.4, 1.4, -2]}  scale={0.5}  geometry={<dodecahedronGeometry args={[1, 0]} />} color="#ff9f0a" speed={1.6} />
        <Environment preset="city" />
      </Suspense>
      <Rig />
    </Canvas>
  );
}
