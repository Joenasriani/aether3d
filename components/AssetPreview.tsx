import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Grid, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { AssetParams, PolyCount } from '../types';

interface MeshObjectProps {
  params: AssetParams;
  polyCount: PolyCount;
}

const MeshObject: React.FC<MeshObjectProps> = ({ params, polyCount }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const segments = useMemo(() => {
    switch (polyCount) {
      case PolyCount.LOW: return 12;
      case PolyCount.MEDIUM: return 32;
      case PolyCount.HIGH: return 128;
      default: return 32;
    }
  }, [polyCount]);

  // Handle Texture
  const texture = useMemo(() => {
      if (!params.textureBase64) return null;
      const loader = new THREE.TextureLoader();
      return loader.load(params.textureBase64);
  }, [params.textureBase64]);

  if (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.colorSpace = THREE.SRGBColorSpace;
  }

  // Slow rotation for effect
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} scale={new THREE.Vector3(...params.scale)} castShadow receiveShadow>
      {params.shape === 'box' && <boxGeometry args={[1, 1, 1, segments/4, segments/4, segments/4]} />}
      {params.shape === 'sphere' && <sphereGeometry args={[0.7, segments, segments]} />}
      {params.shape === 'cylinder' && <cylinderGeometry args={[0.5, 0.5, 1, segments]} />}
      {params.shape === 'torus' && <torusGeometry args={[0.6, 0.2, segments, segments]} />}
      {params.shape === 'cone' && <coneGeometry args={[0.6, 1.2, segments]} />}
      {params.shape === 'capsule' && <capsuleGeometry args={[0.5, 1, 4, segments]} />}
      {params.shape === 'dodecahedron' && <dodecahedronGeometry args={[0.7, segments > 12 ? 1 : 0]} />}

      <meshStandardMaterial 
        color={params.color} 
        roughness={params.roughness} 
        metalness={params.metalness}
        map={texture}
        envMapIntensity={0.8}
      />
    </mesh>
  );
};

interface AssetPreviewProps {
  params: AssetParams | null;
  polyCount: PolyCount;
  isLoading: boolean;
}

export const AssetPreview: React.FC<AssetPreviewProps> = ({ params, polyCount, isLoading }) => {
  return (
    <div className="w-full h-full relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
      {isLoading && (
         <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
             <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white font-medium animate-pulse">Forging Artifact...</p>
             </div>
         </div>
      )}
      
      {!params && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <p>Ready to generate</p>
        </div>
      )}

      <Canvas shadows camera={{ position: [0, 0, 4], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={['#111827']} />
        
        {params && (
          <Stage environment="city" intensity={0.5} adjustCamera={false}>
            <MeshObject params={params} polyCount={polyCount} />
          </Stage>
        )}
        
        <Grid 
            renderOrder={-1} 
            position={[0, -1.2, 0]} 
            infiniteGrid 
            cellSize={0.5} 
            sectionSize={2.5} 
            fadeDistance={25} 
            sectionColor="#4b5563" 
            cellColor="#374151" 
        />
        
        <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
        <Environment preset="studio" />
      </Canvas>
      
      {/* HUD Overlay */}
      <div className="absolute bottom-4 left-4 pointer-events-none">
          {params && (
             <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 text-xs space-y-1">
                 <div className="font-bold text-primary-400 uppercase tracking-wider">{params.name}</div>
                 <div className="text-gray-300">Shape: <span className="text-white">{params.shape}</span></div>
                 <div className="text-gray-300">Materials: <span className="text-white">Standard</span></div>
             </div>
          )}
      </div>
    </div>
  );
};
