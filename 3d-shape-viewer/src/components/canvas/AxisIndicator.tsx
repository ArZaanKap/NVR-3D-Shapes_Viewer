import { useRef } from 'react';
import * as THREE from 'three';
import { COLORS } from '../../utils/constants';

// Z-up coordinate system: X=front(red), Y=side(green), Z=up(blue)
export const AxisIndicator = () => {
  const groupRef = useRef<THREE.Group>(null);

  const axisLength = 0.5;
  const axisRadius = 0.02;

  return (
    <group ref={groupRef} position={[0, 0, 0.01]}>
      {/* X Axis - Red (front) */}
      <mesh position={[axisLength / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[axisRadius, axisRadius, axisLength, 8]} />
        <meshBasicMaterial color={COLORS.axisX} />
      </mesh>
      <mesh position={[axisLength, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[axisRadius * 2, axisRadius * 6, 8]} />
        <meshBasicMaterial color={COLORS.axisX} />
      </mesh>

      {/* Y Axis - Green (side) - cylinder points along Y by default, no rotation needed */}
      <mesh position={[0, axisLength / 2, 0]}>
        <cylinderGeometry args={[axisRadius, axisRadius, axisLength, 8]} />
        <meshBasicMaterial color={COLORS.axisY} />
      </mesh>
      <mesh position={[0, axisLength, 0]}>
        <coneGeometry args={[axisRadius * 2, axisRadius * 6, 8]} />
        <meshBasicMaterial color={COLORS.axisY} />
      </mesh>

      {/* Z Axis - Blue (up) - rotate cylinder to point along Z */}
      <mesh position={[0, 0, axisLength / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[axisRadius, axisRadius, axisLength, 8]} />
        <meshBasicMaterial color={COLORS.axisZ} />
      </mesh>
      <mesh position={[0, 0, axisLength]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[axisRadius * 2, axisRadius * 6, 8]} />
        <meshBasicMaterial color={COLORS.axisZ} />
      </mesh>
    </group>
  );
};
