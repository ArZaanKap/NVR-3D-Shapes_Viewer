import * as THREE from 'three';
import { SHAPE_DEFINITIONS } from '../types/shapes';
import type { ShapeType, SceneObject } from '../types/shapes';
import { getShapeCenterOffset } from './geometryBuilder';

/**
 * Get the occupied grid cells for a shape at a given position and rotation.
 * This must match how BaseShape visually renders shapes (with centerOffset).
 */
export function getOccupiedCells(
  type: ShapeType,
  position: THREE.Vector3,
  rotation: THREE.Euler
): Array<{ x: number; y: number; z: number }> {
  const definition = SHAPE_DEFINITIONS.find((d) => d.type === type);
  if (!definition) return [];

  const cells: Array<{ x: number; y: number; z: number }> = [];

  // Get center offset (same as used in BaseShape visual rendering)
  const centerOffset = getShapeCenterOffset(type);

  // Create rotation matrix
  const rotMatrix = new THREE.Matrix4().makeRotationFromEuler(rotation);

  for (const block of definition.blocks) {
    // Block extends from (x,y,z) to (x+1,y+1,z+1), so use center at (x+0.5, y+0.5, z+0.5)
    // Add centerOffset to match visual rendering (centers the geometry before rotation)
    const vec = new THREE.Vector3(
      block.x + 0.5 + centerOffset.x,
      block.y + 0.5 + centerOffset.y,
      block.z + 0.5 + centerOffset.z
    );

    // Apply rotation (around center, which is now at origin)
    vec.applyMatrix4(rotMatrix);

    // Add position and floor to get grid cell
    cells.push({
      x: Math.floor(position.x + vec.x),
      y: Math.floor(position.y + vec.y),
      z: Math.floor(position.z + vec.z),
    });
  }

  return cells;
}

/**
 * Check if a new shape would collide with existing shapes
 */
export function checkCollision(
  newType: ShapeType,
  newPosition: THREE.Vector3,
  newRotation: THREE.Euler,
  existingObjects: SceneObject[],
  excludeId?: string
): boolean {
  const newCells = getOccupiedCells(newType, newPosition, newRotation);

  for (const obj of existingObjects) {
    if (obj.id === excludeId) continue;

    const existingCells = getOccupiedCells(obj.type, obj.position, obj.rotation);

    // Check if any cells overlap
    for (const newCell of newCells) {
      for (const existingCell of existingCells) {
        if (
          newCell.x === existingCell.x &&
          newCell.y === existingCell.y &&
          newCell.z === existingCell.z
        ) {
          return true; // Collision detected
        }
      }
    }
  }

  return false; // No collision
}

/**
 * Check if position is below ground (z < 0) - Z-up coordinate system
 */
export function checkBelowGround(
  type: ShapeType,
  position: THREE.Vector3,
  rotation: THREE.Euler
): boolean {
  const cells = getOccupiedCells(type, position, rotation);
  return cells.some(cell => cell.z < 0);
}

/**
 * Get the minimum Z position for a shape to sit on the ground (Z-up coordinate system).
 * This accounts for the center offset applied in BaseShape.
 * NOTE: Still named getGroundY for backward compatibility, but calculates Z position.
 */
export function getGroundY(type: ShapeType, rotation: THREE.Euler): number {
  const definition = SHAPE_DEFINITIONS.find((d) => d.type === type);
  if (!definition) return 0.5;

  const rotMatrix = new THREE.Matrix4().makeRotationFromEuler(rotation);

  // Calculate bounding box after rotation - use Z for vertical (Z-up)
  let minZ = Infinity, maxZ = -Infinity;

  for (const block of definition.blocks) {
    const vec = new THREE.Vector3(block.x, block.y, block.z);
    vec.applyMatrix4(rotMatrix);
    minZ = Math.min(minZ, vec.z);
    maxZ = Math.max(maxZ, vec.z + 1);
  }

  // Center offset (same as getShapeCenterOffset but for rotated shape)
  const centerOffsetZ = -(minZ + maxZ) / 2;

  // The geometry bottom is at minZ (blocks extend from z to z+1)
  // After center offset, local bottom = minZ + centerOffsetZ
  // For world bottom to be at 0: position.z + localBottom = 0
  // So position.z = -localBottom
  const localBottom = minZ + centerOffsetZ;

  return -localBottom;
}
