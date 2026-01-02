import { useMemo } from 'react';
import * as THREE from 'three';
import { GRID_SIZE } from '../../utils/constants';

export const Grid = () => {
  // Create grid helper once with correct rotation for Z-up
  const gridHelper = useMemo(() => {
    const grid = new THREE.GridHelper(GRID_SIZE, GRID_SIZE, '#cbd5e1', '#e2e8f0');
    grid.rotation.x = Math.PI / 2; // Rotate to lie flat on XY plane (Z-up)
    grid.position.set(0.0, 0.0, 0.0); // Offset by 0.5 to align with shape cell centers
    return grid;
  }, []);


  return <primitive object={gridHelper} />;
};
