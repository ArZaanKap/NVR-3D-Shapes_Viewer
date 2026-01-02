import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SHAPE_DEFINITIONS } from '../types/shapes';
import type { ShapeType } from '../types/shapes';

/**
 * Creates a merged geometry for a shape type based on its block positions.
 * All shapes are composed of 1x1x1 unit cubes merged together.
 * Only external faces are kept to avoid internal geometry.
 */
export function createShapeGeometry(shapeType: ShapeType): THREE.BufferGeometry {
  const definition = SHAPE_DEFINITIONS.find((d) => d.type === shapeType);
  if (!definition) {
    throw new Error(`Unknown shape type: ${shapeType}`);
  }

  // For single block, just return a box
  if (definition.blocks.length === 1) {
    const block = definition.blocks[0];
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    boxGeometry.translate(block.x + 0.5, block.y + 0.5, block.z + 0.5);
    return boxGeometry;
  }

  // Create a set of occupied positions for quick lookup
  const occupied = new Set<string>();
  for (const block of definition.blocks) {
    occupied.add(`${block.x},${block.y},${block.z}`);
  }

  const geometries: THREE.BufferGeometry[] = [];

  // For each block, only add faces that are not adjacent to another block
  for (const block of definition.blocks) {
    const { x, y, z } = block;
    const cx = x + 0.5;
    const cy = y + 0.5;
    const cz = z + 0.5;

    // Check each face direction
    const faces = [
      { dir: [1, 0, 0], pos: [cx + 0.5, cy, cz], rot: [0, Math.PI / 2, 0] },   // +X (right)
      { dir: [-1, 0, 0], pos: [cx - 0.5, cy, cz], rot: [0, -Math.PI / 2, 0] }, // -X (left)
      { dir: [0, 1, 0], pos: [cx, cy + 0.5, cz], rot: [-Math.PI / 2, 0, 0] },  // +Y (top)
      { dir: [0, -1, 0], pos: [cx, cy - 0.5, cz], rot: [Math.PI / 2, 0, 0] },  // -Y (bottom)
      { dir: [0, 0, 1], pos: [cx, cy, cz + 0.5], rot: [0, 0, 0] },             // +Z (front)
      { dir: [0, 0, -1], pos: [cx, cy, cz - 0.5], rot: [0, Math.PI, 0] },      // -Z (back)
    ];

    for (const face of faces) {
      const [dx, dy, dz] = face.dir;
      const neighborKey = `${x + dx},${y + dy},${z + dz}`;

      // Only add face if there's no neighbor in that direction
      if (!occupied.has(neighborKey)) {
        const planeGeo = new THREE.PlaneGeometry(1, 1);
        planeGeo.rotateX(face.rot[0]);
        planeGeo.rotateY(face.rot[1]);
        planeGeo.rotateZ(face.rot[2]);
        planeGeo.translate(face.pos[0], face.pos[1], face.pos[2]);
        geometries.push(planeGeo);
      }
    }
  }

  if (geometries.length === 0) {
    return new THREE.BoxGeometry(1, 1, 1);
  }

  const merged = mergeGeometries(geometries);
  if (!merged) {
    throw new Error('Failed to merge geometries');
  }

  // Dispose individual geometries
  geometries.forEach((g) => g.dispose());

  return merged;
}

/**
 * Gets the center offset for a shape to center it around the origin.
 * The geometry has block centers at (x+0.5, y+0.5, z+0.5).
 */
export function getShapeCenterOffset(shapeType: ShapeType): THREE.Vector3 {
  const definition = SHAPE_DEFINITIONS.find((d) => d.type === shapeType);
  if (!definition) {
    return new THREE.Vector3(0, 0, 0);
  }

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const block of definition.blocks) {
    // Block extends from (x, y, z) to (x+1, y+1, z+1)
    minX = Math.min(minX, block.x);
    maxX = Math.max(maxX, block.x + 1);
    minY = Math.min(minY, block.y);
    maxY = Math.max(maxY, block.y + 1);
    minZ = Math.min(minZ, block.z);
    maxZ = Math.max(maxZ, block.z + 1);
  }

  // Center the shape around origin
  return new THREE.Vector3(
    -(minX + maxX) / 2,
    -(minY + maxY) / 2,
    -(minZ + maxZ) / 2
  );
}

/**
 * Gets the bounding box dimensions of a shape
 */
export function getShapeDimensions(shapeType: ShapeType): { width: number; height: number; depth: number } {
  const definition = SHAPE_DEFINITIONS.find((d) => d.type === shapeType);
  if (!definition) {
    return { width: 1, height: 1, depth: 1 };
  }

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const block of definition.blocks) {
    minX = Math.min(minX, block.x);
    maxX = Math.max(maxX, block.x + 1);
    minY = Math.min(minY, block.y);
    maxY = Math.max(maxY, block.y + 1);
    minZ = Math.min(minZ, block.z);
    maxZ = Math.max(maxZ, block.z + 1);
  }

  return {
    width: maxX - minX,
    height: maxY - minY,
    depth: maxZ - minZ,
  };
}
