import * as THREE from 'three';

export type ShapeType =
  | 'cube-1x1x1'
  | 'cuboid-1x1x2'
  | 'cuboid-1x1x3'
  | 'l-shape-short'
  | 'l-shape-long'
  | 't-shape-short'
  | 't-shape-long';

export interface SceneObject {
  id: string;
  type: ShapeType;
  position: THREE.Vector3;
  rotation: THREE.Euler;
}

export type ToolType = 'cursor' | 'rotate' | 'translate';

export interface ShapeDefinition {
  type: ShapeType;
  name: string;
  blocks: Array<{ x: number; y: number; z: number }>;
}

// Shape definitions - all shapes are made of 1x1x1 unit cubes
export const SHAPE_DEFINITIONS: ShapeDefinition[] = [
  {
    type: 'cube-1x1x1',
    name: 'Cube',
    blocks: [{ x: 0, y: 0, z: 0 }]
  },
  {
    type: 'cuboid-1x1x2',
    name: 'Cuboid 1x2',
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 }
    ]
  },
  {
    type: 'cuboid-1x1x3',
    name: 'Cuboid 1x3',
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 2, z: 0 }
    ]
  },
  {
    type: 'l-shape-short',
    name: 'L Short',
    // 2 horizontal + 1 on top-left (3 cubes)
    blocks: [
      { x: 0, y: 1, z: 0 },  // top-left
      { x: 0, y: 0, z: 0 },  // bottom-left
      { x: 1, y: 0, z: 0 }   // bottom-right
    ]
  },
  {
    type: 'l-shape-long',
    name: 'L Long',
    // 1 top-left, 1 under it, 2 to the right (4 cubes)
    blocks: [
      { x: 0, y: 1, z: 0 },  // top-left
      { x: 0, y: 0, z: 0 },  // bottom-left
      { x: 1, y: 0, z: 0 },  // bottom-middle
      { x: 2, y: 0, z: 0 }   // bottom-right
    ]
  },
  {
    type: 't-shape-short',
    name: 'T Short',
    // 3 horizontal + 1 down from center (4 cubes)
    blocks: [
      { x: 0, y: 1, z: 0 },  // top-left
      { x: 1, y: 1, z: 0 },  // top-center
      { x: 2, y: 1, z: 0 },  // top-right
      { x: 1, y: 0, z: 0 }   // bottom-center
    ]
  },
  {
    type: 't-shape-long',
    name: 'T Long',
    // 3 horizontal + 2 down from center (5 cubes)
    blocks: [
      { x: 0, y: 2, z: 0 },  // top-left
      { x: 1, y: 2, z: 0 },  // top-center
      { x: 2, y: 2, z: 0 },  // top-right
      { x: 1, y: 1, z: 0 },  // middle-center
      { x: 1, y: 0, z: 0 }   // bottom-center
    ]
  }
];
