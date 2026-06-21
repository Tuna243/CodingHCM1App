'use client';

import { Bounds, ContactShadows, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

const POLO_MODEL_URL = '/models/polo_black_with_logo.glb?v=20260619';

function CameraSetup({ resetKey }: { resetKey: number }) {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    camera.position.set(0, 0.6, 5.7);
    camera.lookAt(0, 0.25, 0);
    camera.updateProjectionMatrix();
  }, [camera, resetKey]);

  return null;
}

function PoloModel() {
  const { scene: source } = useGLTF(POLO_MODEL_URL);
  const model = useMemo(() => {
    const clone = source.clone(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = 0.046;

    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
    });

    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    return clone;
  }, [source]);

  return <primitive object={model} />;
}

useGLTF.preload(POLO_MODEL_URL);

export default function UniformPoloScene({ resetKey = 0 }: { resetKey?: number }) {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 5.7], fov: 34 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      shadows
    >
      <ambientLight intensity={1.6} />
      <hemisphereLight args={['#ffffff', '#b6d5ca', 1.5]} />
      <directionalLight position={[3.5, 5, 4]} intensity={3.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 1, 2]} intensity={1.2} color="#6cc3a0" />

      <CameraSetup resetKey={resetKey} />
      <Bounds fit clip observe margin={1.25}>
        <PoloModel />
      </Bounds>
      <ContactShadows position={[0, -1.55, 0]} opacity={0.3} scale={5} blur={2.7} far={4} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        minDistance={4.2}
        maxDistance={7.2}
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.68}
        target={[0, 0.25, 0]}
      />
    </Canvas>
  );
}
