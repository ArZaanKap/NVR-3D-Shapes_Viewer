import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import type { ReactNode } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Grid } from './Grid';
import { AxisIndicator } from './AxisIndicator';
import { Lighting } from './Lighting';
import { CAMERA, COLORS } from '../../utils/constants';

interface SceneProps {
  children?: ReactNode;
}

export const Scene = ({ children }: SceneProps) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <Canvas
      camera={{
        position: CAMERA.position,
        fov: CAMERA.fov,
        near: CAMERA.near,
        far: CAMERA.far,
      }}
      style={{ background: COLORS.background }}
    >
      <Lighting />
      <Grid />
      <AxisIndicator />
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={50}
        makeDefault
      />
      {children}
    </Canvas>
  );
};
