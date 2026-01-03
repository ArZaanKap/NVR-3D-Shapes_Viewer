import { create } from 'zustand';
import * as THREE from 'three';
import type { SceneObject, ShapeType, ToolType } from '../types/shapes';
import { getGroundY, checkCollision } from '../utils/collision';
import { getShapeDimensions } from '../utils/geometryBuilder';

export type CameraView = 'perspective' | 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';

interface RotationPreview {
  type: ShapeType;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  isColliding: boolean;
}

interface SceneState {
  objects: SceneObject[];
  selectedId: string | null;
  activeTool: ToolType;
  hoveredFace: { objectId: string; faceIndex: number } | null;
  cameraView: CameraView;
  isDragging: boolean;
  rotationPreview: RotationPreview | null;
  camera: THREE.Camera | null;

  // Actions
  addObject: (type: ShapeType, position: THREE.Vector3) => string;
  removeObject: (id: string) => void;
  updateObjectPosition: (id: string, position: THREE.Vector3) => void;
  updateObjectRotation: (id: string, rotation: THREE.Euler) => void;
  selectObject: (id: string | null) => void;
  setTool: (tool: ToolType) => void;
  setHoveredFace: (face: { objectId: string; faceIndex: number } | null) => void;
  resetScene: () => void;
  rotateSelected: (axis: 'x' | 'y' | 'z', angle: number, cameraPosition: THREE.Vector3) => void;
  setCameraView: (view: CameraView) => void;
  setIsDragging: (dragging: boolean) => void;
  clearRotationPreview: () => void;
  setCamera: (camera: THREE.Camera | null) => void;
}

export const useSceneStore = create<SceneState>((set, get) => ({
  objects: [],
  selectedId: null,
  activeTool: 'cursor',
  hoveredFace: null,
  cameraView: 'perspective',
  isDragging: false,
  rotationPreview: null,
  camera: null,

  addObject: (type, position) => {
    const id = crypto.randomUUID();
    set((state) => ({
      objects: [
        ...state.objects,
        {
          id,
          type,
          position: position.clone(),
          rotation: new THREE.Euler(0, 0, 0),
        },
      ],
    }));
    return id;
  },

  removeObject: (id) => {
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  updateObjectPosition: (id, position) => {
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, position: position.clone() } : obj
      ),
    }));
  },

  updateObjectRotation: (id, rotation) => {
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, rotation: rotation.clone() } : obj
      ),
    }));
  },

  selectObject: (id) => {
    set({ selectedId: id });
  },

  setTool: (tool) => {
    set({ activeTool: tool });
  },

  setHoveredFace: (face) => {
    set({ hoveredFace: face });
  },

  resetScene: () => {
    set({ objects: [], selectedId: null });
  },

  rotateSelected: (axis, angle, _cameraPosition) => {
    const { selectedId, objects } = get();
    if (!selectedId) return;

    const obj = objects.find(o => o.id === selectedId);
    if (!obj) return;

    // Get shape dimensions
    const dims = getShapeDimensions(obj.type);
    const halfW = dims.width / 2;
    const halfH = dims.height / 2;
    const halfD = dims.depth / 2;

    // Pivot point - upper corner in world space (matches gizmo position)
    const localUpperCorner = new THREE.Vector3(halfW, halfH, halfD);
    const pivot = localUpperCorner.clone()
      .applyEuler(obj.rotation)
      .add(obj.position);

    // Create rotation quaternion for this increment (world-space axis)
    const rotationAxis = new THREE.Vector3(
      axis === 'x' ? 1 : 0,
      axis === 'y' ? 1 : 0,
      axis === 'z' ? 1 : 0
    );
    const incrementQuat = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);

    // Current rotation as quaternion
    const currentQuat = new THREE.Quaternion().setFromEuler(obj.rotation);

    // New rotation = increment * current (apply increment in world space)
    const newQuat = incrementQuat.clone().multiply(currentQuat);
    const newRotation = new THREE.Euler().setFromQuaternion(newQuat);

    // Rotate position around pivot using quaternion
    const posRelativeToPivot = obj.position.clone().sub(pivot);
    posRelativeToPivot.applyQuaternion(incrementQuat);
    const newPosition = pivot.clone().add(posRelativeToPivot);

    // Snap X and Y to grid, but only constrain Z to not go below ground
    newPosition.x = Math.round(newPosition.x * 2) / 2;
    newPosition.y = Math.round(newPosition.y * 2) / 2;
    const groundZ = getGroundY(obj.type, newRotation);
    newPosition.z = Math.max(groundZ, Math.round(newPosition.z * 2) / 2);

    // Check for collision before applying rotation
    if (checkCollision(obj.type, newPosition, newRotation, objects, obj.id)) {
      // Collision detected - show preview instead of applying rotation
      set({
        rotationPreview: {
          type: obj.type,
          position: newPosition,
          rotation: newRotation,
          isColliding: true,
        },
      });
      return;
    }

    // No collision - apply rotation and clear any preview
    set({
      objects: objects.map((o) =>
        o.id === selectedId ? { ...o, rotation: newRotation, position: newPosition } : o
      ),
      rotationPreview: null,
    });
  },

  setCameraView: (view) => {
    set({ cameraView: view });
  },

  setIsDragging: (dragging) => {
    set({ isDragging: dragging });
  },

  clearRotationPreview: () => {
    set({ rotationPreview: null });
  },

  setCamera: (camera) => {
    set({ camera });
  },
}));
