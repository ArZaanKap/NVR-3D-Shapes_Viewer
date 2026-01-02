import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { ShapeType } from '../../types/shapes';
import { createShapeGeometry, getShapeCenterOffset } from '../../utils/geometryBuilder';

interface BaseShapeProps {
  type: ShapeType;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  isSelected?: boolean;
  isPreview?: boolean;
  isColliding?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
}

export const BaseShape = ({
  type,
  position,
  rotation,
  isSelected = false,
  isPreview = false,
  isColliding = false,
  onClick,
  onPointerDown,
  onPointerOver,
  onPointerOut,
}: BaseShapeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create geometry, edges, and center offset
  const { geometry, edgesGeometry, centerOffset } = useMemo(() => {
    const geo = createShapeGeometry(type);
    const offset = getShapeCenterOffset(type);
    // EdgesGeometry with threshold angle to only show sharp edges (90 degrees = ~1.57 rad)
    const edges = new THREE.EdgesGeometry(geo, 1);
    return { geometry: geo, edgesGeometry: edges, centerOffset: offset };
  }, [type]);

  // Determine color based on state
  const color = useMemo(() => {
    if (isColliding) return '#fca5a5'; // Light red for collision
    if (isPreview) return '#86efac'; // Light green for valid preview
    if (isSelected) return '#bfdbfe'; // Lighter blue when selected
    return '#e2e8f0'; // Light grey default
  }, [isSelected, isPreview, isColliding]);

  // Outline color based on state
  const outlineColor = useMemo(() => {
    if (isColliding) return '#dc2626'; // Red
    if (isSelected) return '#2563eb'; // Blue
    return '#1e293b'; // Dark grey/black
  }, [isColliding, isSelected]);

  // Line width - increased for bolder outlines (Note: WebGL may clamp to 1 on some browsers)
  const lineWidth = isSelected ? 3 : 2.5;

  return (
    <group position={position} rotation={rotation}>
      <group position={centerOffset}>
        {/* Main shape mesh */}
        <mesh
          ref={meshRef}
          geometry={geometry}
          onClick={onClick}
          onPointerDown={onPointerDown}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
        >
          <meshStandardMaterial
            color={color}
            transparent={isPreview}
            opacity={isPreview ? 0.7 : 1}
            roughness={0.4}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Edge lines - bold outline for clear shape definition */}
        <lineSegments geometry={edgesGeometry}>
          <lineBasicMaterial
            color={outlineColor}
            linewidth={lineWidth}
            transparent={isPreview}
            opacity={isPreview ? 0.8 : 1}
          />
        </lineSegments>

        {/* Secondary edge pass for thicker appearance (helps on browsers that clamp linewidth) */}
        <lineSegments geometry={edgesGeometry} scale={[1.001, 1.001, 1.001]}>
          <lineBasicMaterial
            color={outlineColor}
            linewidth={lineWidth}
            transparent={isPreview}
            opacity={isPreview ? 0.6 : 0.8}
          />
        </lineSegments>
      </group>
    </group>
  );
};
