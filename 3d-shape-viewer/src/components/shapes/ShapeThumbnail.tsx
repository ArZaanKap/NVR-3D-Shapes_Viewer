import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { SHAPE_DEFINITIONS } from '../../types/shapes';
import type { ShapeType } from '../../types/shapes';
import { BaseShape } from './BaseShape';
import { getShapeDimensions } from '../../utils/geometryBuilder';

interface ShapeThumbnailProps {
  type: ShapeType;
  onDragStart: (e: React.DragEvent, type: ShapeType) => void;
}

// Rotating shape component for thumbnail animation
const RotatingShape = ({ type }: { type: ShapeType }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Slow continuous rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5; // Slow rotation speed
    }
  });

  return (
    <group ref={groupRef}>
      <BaseShape
        type={type}
        position={new THREE.Vector3(0, 0, 0)}
        rotation={new THREE.Euler(-0.3, 0, 0)}
      />
    </group>
  );
};

export const ShapeThumbnail = ({ type, onDragStart }: ShapeThumbnailProps) => {
  const definition = SHAPE_DEFINITIONS.find((d) => d.type === type);
  const name = definition?.name || type;

  const cameraDistance = useMemo(() => {
    const dims = getShapeDimensions(type);
    const maxDim = Math.max(dims.width, dims.height, dims.depth);
    return maxDim * 1.8 + 1.5;
  }, [type]);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, type)}
      className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing group"
    >
      <div className="w-[72px] h-[72px] rounded-xl bg-slate-50 border border-slate-200 group-hover:border-blue-300 group-hover:shadow-md transition-all overflow-hidden">
        <Canvas
          camera={{
            position: [cameraDistance, cameraDistance * 0.8, cameraDistance],
            fov: 45,
          }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 8, 5]} intensity={1} color="#ffffff" />
          <directionalLight position={[-3, 2, -3]} intensity={0.3} />
          <RotatingShape type={type} />
        </Canvas>
      </div>
      <span className="text-[10px] text-slate-500 group-hover:text-slate-700 font-medium text-center leading-tight transition-colors">
        {name}
      </span>
    </div>
  );
};
