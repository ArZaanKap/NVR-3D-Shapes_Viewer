import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useSceneStore } from '../../stores/sceneStore';
import { checkCollision, getGroundY } from '../../utils/collision';
import { ROTATION_INCREMENT } from '../../utils/constants';
import { getShapeDimensions, getRotatedShapeCenterOffset } from '../../utils/geometryBuilder';
import { BaseShape } from '../shapes/BaseShape';
import type { SceneObject } from '../../types/shapes';

interface GizmoProps {
  object: SceneObject;
}

// Simple draggable arrow for one axis with preview support
const AxisArrow = ({
  axis,
  color,
  position,
  objectPosition,
  onPreviewChange,
}: {
  axis: 'x' | 'y' | 'z';
  color: string;
  position: [number, number, number];
  objectPosition: THREE.Vector3;
  onPreviewChange?: (preview: { position: THREE.Vector3; isColliding: boolean } | null) => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const { gl, camera } = useThree();
  const startMouse = useRef<{ x: number; y: number } | null>(null);
  const startValue = useRef<number>(0);

  const updateObjectPosition = useSceneStore((state) => state.updateObjectPosition);
  const setIsDragging = useSceneStore((state) => state.setIsDragging);
  const objects = useSceneStore((state) => state.objects);
  const selectedId = useSceneStore((state) => state.selectedId);

  // Get the object from the store to have the latest position
  const currentObject = objects.find(o => o.id === selectedId);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setDragging(true);
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';

    startMouse.current = { x: e.clientX, y: e.clientY };
    startValue.current = objectPosition[axis === 'x' ? 'x' : axis === 'y' ? 'y' : 'z'];

    const handleMove = (moveEvent: PointerEvent) => {
      if (!startMouse.current || !currentObject) return;

      // Calculate mouse delta in screen pixels
      const screenDeltaX = moveEvent.clientX - startMouse.current.x;
      const screenDeltaY = moveEvent.clientY - startMouse.current.y;

      // Get canvas dimensions for NDC conversion
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();

      // Project two points along the axis to screen space
      // Point 1: object position (origin)
      const origin = objectPosition.clone();
      const originNDC = origin.clone().project(camera);

      // Point 2: object position + axis direction
      const axisEnd = origin.clone();
      if (axis === 'x') axisEnd.x += 1;
      else if (axis === 'y') axisEnd.y += 1;
      else axisEnd.z += 1;
      const axisEndNDC = axisEnd.clone().project(camera);

      // Calculate screen-space axis direction (in pixels)
      // NDC ranges from -1 to 1, convert to pixel space
      const screenOriginX = (originNDC.x + 1) * rect.width / 2;
      const screenOriginY = (1 - originNDC.y) * rect.height / 2;  // Y flipped
      const screenEndX = (axisEndNDC.x + 1) * rect.width / 2;
      const screenEndY = (1 - axisEndNDC.y) * rect.height / 2;

      const screenAxisDirX = screenEndX - screenOriginX;
      const screenAxisDirY = screenEndY - screenOriginY;

      const len = Math.sqrt(screenAxisDirX * screenAxisDirX + screenAxisDirY * screenAxisDirY);

      // If axis is nearly perpendicular to view (very small screen projection)
      if (len < 1) {
        return;  // Skip - can't meaningfully drag this axis from this view
      }

      // Normalize screen axis direction
      const normX = screenAxisDirX / len;
      const normY = screenAxisDirY / len;

      // Dot product: how much of the mouse movement is along the axis direction
      const dotProduct = screenDeltaX * normX + screenDeltaY * normY;

      // Scale to world units
      const baseSensitivity = 0.015;
      const delta = dotProduct * baseSensitivity;

      // Calculate new position with rotation-aware snapping
      // Uses the rotated bounding box to determine correct grid alignment
      const offset = getRotatedShapeCenterOffset(currentObject.type, currentObject.rotation);
      const axisOffset = axis === 'x' ? offset.x : axis === 'y' ? offset.y : offset.z;
      const newValue = Math.round(startValue.current + delta + axisOffset) - axisOffset;
      const newPos = currentObject.position.clone();

      if (axis === 'x') newPos.x = newValue;
      else if (axis === 'y') newPos.y = newValue;
      else {
        // Z axis (up) - enforce ground constraint
        const groundZ = getGroundY(currentObject.type, currentObject.rotation);
        newPos.z = Math.max(groundZ, newValue);
      }

      // Check collision
      const hasCollision = checkCollision(currentObject.type, newPos, currentObject.rotation, objects, currentObject.id);

      if (!hasCollision) {
        // No collision - update position and clear any preview
        updateObjectPosition(currentObject.id, newPos);
        onPreviewChange?.(null);
      } else {
        // Collision - show preview at invalid position
        onPreviewChange?.({ position: newPos, isColliding: true });
      }
    };

    const handleUp = () => {
      setDragging(false);
      setIsDragging(false);
      gl.domElement.style.cursor = 'auto';
      startMouse.current = null;
      // Clear preview on mouse up
      onPreviewChange?.(null);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  // Calculate rotation for the arrow (Z-up coordinate system)
  // Cylinder geometry points along local Y by default
  // X arrow: points along +X (front) - rotate cylinder from Y to X
  // Y arrow: points along +Y (side) - no rotation needed
  // Z arrow: points along +Z (up) - rotate cylinder from Y to Z
  const rotation: [number, number, number] =
    axis === 'x' ? [0, 0, -Math.PI / 2] :  // Rotate Y->X (points along X)
    axis === 'y' ? [0, 0, 0] :              // No rotation (cylinder already along Y)
    [Math.PI / 2, 0, 0];                    // Rotate Y->Z (points up)

  const hoverColor =
    axis === 'x' ? '#f87171' :
    axis === 'y' ? '#4ade80' :
    '#60a5fa';

  return (
    <group position={position} rotation={rotation}>
      {/* Shaft - half size */}
      <mesh
        position={[0, 0.25, 0]}
        onPointerDown={handlePointerDown}
        onPointerOver={() => { setHovered(true); gl.domElement.style.cursor = 'grab'; }}
        onPointerOut={() => { setHovered(false); if (!dragging) gl.domElement.style.cursor = 'auto'; }}
      >
        <cylinderGeometry args={[0.04, 0.04, 0.5, 12]} />
        <meshStandardMaterial
          color={hovered || dragging ? hoverColor : color}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
      {/* Arrow head - half size */}
      <mesh
        position={[0, 0.55, 0]}
        onPointerDown={handlePointerDown}
        onPointerOver={() => { setHovered(true); gl.domElement.style.cursor = 'grab'; }}
        onPointerOut={() => { setHovered(false); if (!dragging) gl.domElement.style.cursor = 'auto'; }}
      >
        <coneGeometry args={[0.09, 0.175, 12]} />
        <meshStandardMaterial
          color={hovered || dragging ? hoverColor : color}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
};

// Rotation axis with line and small arc at the end (based on reference image)
const RotationAxisWithArc = ({
  axis,
  color,
  onClick,
}: {
  axis: 'x' | 'y' | 'z';
  color: string;
  onClick: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const { gl } = useThree();

  const hoverColor =
    axis === 'x' ? '#f87171' :
    axis === 'y' ? '#4ade80' :
    '#60a5fa';

  const axisLength = 1.2;
  const arcRadius = 0.2;
  const arcAngle = Math.PI * 1.5; // 270 degrees

  // Create arc geometry (270 degrees)
  const arcGeometry = useMemo(() => {
    return new THREE.TorusGeometry(arcRadius, 0.02, 8, 24, arcAngle);
  }, []);

  // Rotation to orient the axis line for each axis (Z-up coordinate system)
  // Cylinder geometry points along local Y by default
  // X: front, Y: side, Z: up
  const lineRotation: [number, number, number] =
    axis === 'x' ? [0, 0, -Math.PI / 2] :  // Rotate Y->X (points along X)
    axis === 'y' ? [0, 0, 0] :              // No rotation (cylinder already along Y)
    [Math.PI / 2, 0, 0];                    // Rotate Y->Z (points up)

  // Position arc at end of axis line
  const arcGroupPosition: [number, number, number] =
    axis === 'x' ? [axisLength, 0, 0] :
    axis === 'y' ? [0, axisLength, 0] :
    [0, 0, axisLength];

  // Rotation to orient the arc perpendicular to the axis (Z-up)
  // Arc should show rotation plane (perpendicular to the axis)
  const arcGroupRotation: [number, number, number] =
    axis === 'x' ? [0, Math.PI / 2, 0] :   // YZ plane rotation around X
    axis === 'y' ? [-Math.PI / 2, 0, 0] :  // XZ plane rotation around Y
    [0, 0, 0];                              // XY plane rotation around Z

  // Arrow position at end of 270° arc
  const arrowAngle = arcAngle;
  const arrowPosition: [number, number, number] = [
    arcRadius * Math.cos(arrowAngle),
    arcRadius * Math.sin(arrowAngle),
    0
  ];

  // Arrow rotation to point tangent to arc (clockwise direction)
  const arrowRotation: [number, number, number] = [0, 0, arrowAngle - Math.PI / 2];

  const currentColor = hovered ? hoverColor : color;

  return (
    <group>
      {/* Axis line */}
      <group rotation={lineRotation}>
        <mesh position={[0, axisLength / 2, 0]}>
          <cylinderGeometry args={[0.015, 0.015, axisLength, 8]} />
          <meshStandardMaterial color={currentColor} roughness={0.3} metalness={0.4} />
        </mesh>
      </group>

      {/* Arc at end of axis */}
      <group position={arcGroupPosition} rotation={arcGroupRotation}>
        <mesh
          geometry={arcGeometry}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onPointerOver={() => { setHovered(true); gl.domElement.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); gl.domElement.style.cursor = 'auto'; }}
        >
          <meshStandardMaterial
            color={currentColor}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>

        {/* Arrow head at end of arc */}
        <mesh
          position={arrowPosition}
          rotation={arrowRotation}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onPointerOver={() => { setHovered(true); gl.domElement.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); gl.domElement.style.cursor = 'auto'; }}
        >
          <coneGeometry args={[0.05, 0.1, 8]} />
          <meshStandardMaterial
            color={currentColor}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>
      </group>
    </group>
  );
};

// Translation Gizmo - XYZ arrows positioned at top-front-right corner
export const TranslationGizmo = ({ object }: GizmoProps) => {
  const [preview, setPreview] = useState<{ position: THREE.Vector3; isColliding: boolean } | null>(null);

  // Calculate corner position based on shape dimensions and rotation
  const gizmoPosition = useMemo(() => {
    const dims = getShapeDimensions(object.type);
    // Offset to top-front-right corner
    const cornerOffset = new THREE.Vector3(
      dims.width / 2,
      dims.height / 2,
      dims.depth / 2
    );
    // Apply the object's rotation to the corner offset
    cornerOffset.applyEuler(object.rotation);
    // Add to object position
    return new THREE.Vector3(
      object.position.x + cornerOffset.x,
      object.position.y + cornerOffset.y,
      object.position.z + cornerOffset.z
    );
  }, [object.type, object.position, object.rotation]);

  return (
    <>
      {/* Preview shape for invalid (colliding) positions */}
      {preview && preview.isColliding && (
        <BaseShape
          type={object.type}
          position={preview.position}
          rotation={object.rotation}
          isPreview={true}
          isColliding={true}
        />
      )}

      <group position={gizmoPosition}>
        {/* Translation arrows */}
        <AxisArrow axis="x" color="#ef4444" position={[0, 0, 0]} objectPosition={object.position} onPreviewChange={setPreview} />
        <AxisArrow axis="y" color="#22c55e" position={[0, 0, 0]} objectPosition={object.position} onPreviewChange={setPreview} />
        <AxisArrow axis="z" color="#3b82f6" position={[0, 0, 0]} objectPosition={object.position} onPreviewChange={setPreview} />

        {/* Center sphere - half size */}
        <mesh>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Label - adjusted position */}
        <Html position={[0, 0.9, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="text-[10px] text-slate-500 bg-white/90 px-2 py-1 rounded-lg shadow-sm border border-slate-200 font-medium">
            Drag arrows to move
          </div>
        </Html>
      </group>
    </>
  );
};

// Rotation Gizmo - Axis lines with small arcs at the ends (based on reference image)
export const RotationGizmo = ({ object }: GizmoProps) => {
  const { camera } = useThree();
  const rotateSelected = useSceneStore((state) => state.rotateSelected);
  const rotationPreview = useSceneStore((state) => state.rotationPreview);
  const clearRotationPreview = useSceneStore((state) => state.clearRotationPreview);

  // Calculate corner position (same as TranslationGizmo - upper corner)
  const gizmoPosition = useMemo(() => {
    const dims = getShapeDimensions(object.type);
    const cornerOffset = new THREE.Vector3(
      dims.width / 2,
      dims.height / 2,
      dims.depth / 2
    );
    cornerOffset.applyEuler(object.rotation);
    return new THREE.Vector3(
      object.position.x + cornerOffset.x,
      object.position.y + cornerOffset.y,
      object.position.z + cornerOffset.z
    );
  }, [object.type, object.position, object.rotation]);

  const handleRotate = (axis: 'x' | 'y' | 'z') => {
    // Clear any existing preview before attempting new rotation
    clearRotationPreview();
    // Pass current camera position (kept for compatibility, but pivot is now fixed to upper corner)
    rotateSelected(axis, ROTATION_INCREMENT, camera.position.clone());
  };

  return (
    <>
      {/* Preview shape for invalid (colliding) rotations */}
      {rotationPreview && rotationPreview.isColliding && (
        <BaseShape
          type={rotationPreview.type}
          position={rotationPreview.position}
          rotation={rotationPreview.rotation}
          isPreview={true}
          isColliding={true}
        />
      )}

      <group position={gizmoPosition}>
        {/* Center indicator */}
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Axis lines with rotation arcs at the ends */}
        <RotationAxisWithArc axis="x" color="#ef4444" onClick={() => handleRotate('x')} />
        <RotationAxisWithArc axis="y" color="#22c55e" onClick={() => handleRotate('y')} />
        <RotationAxisWithArc axis="z" color="#3b82f6" onClick={() => handleRotate('z')} />

        {/* Label */}
        <Html position={[0, 1.6, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="text-[10px] text-slate-500 bg-white/90 px-2 py-1 rounded-lg shadow-sm border border-slate-200 font-medium">
            Click arc to rotate 90°
          </div>
        </Html>
      </group>
    </>
  );
};

// Legacy combined gizmo (for backward compatibility)
export const ShapeGizmo = ({ object }: GizmoProps) => {
  const { camera } = useThree();
  const [preview, setPreview] = useState<{ position: THREE.Vector3; isColliding: boolean } | null>(null);
  const rotateSelected = useSceneStore((state) => state.rotateSelected);
  const rotationPreview = useSceneStore((state) => state.rotationPreview);
  const clearRotationPreview = useSceneStore((state) => state.clearRotationPreview);

  const handleRotate = (axis: 'x' | 'y' | 'z') => () => {
    clearRotationPreview();
    // Pass current camera position for corner-based rotation
    rotateSelected(axis, ROTATION_INCREMENT, camera.position.clone());
  };

  // Calculate corner position based on shape dimensions and rotation
  const gizmoPosition = useMemo(() => {
    const dims = getShapeDimensions(object.type);
    const cornerOffset = new THREE.Vector3(
      dims.width / 2,
      dims.height / 2,
      dims.depth / 2
    );
    cornerOffset.applyEuler(object.rotation);
    return new THREE.Vector3(
      object.position.x + cornerOffset.x,
      object.position.y + cornerOffset.y,
      object.position.z + cornerOffset.z
    );
  }, [object.type, object.position, object.rotation]);

  return (
    <>
      {/* Preview shape for invalid (colliding) translation positions */}
      {preview && preview.isColliding && (
        <BaseShape
          type={object.type}
          position={preview.position}
          rotation={object.rotation}
          isPreview={true}
          isColliding={true}
        />
      )}

      {/* Preview shape for invalid (colliding) rotations */}
      {rotationPreview && rotationPreview.isColliding && (
        <BaseShape
          type={rotationPreview.type}
          position={rotationPreview.position}
          rotation={rotationPreview.rotation}
          isPreview={true}
          isColliding={true}
        />
      )}

      <group position={gizmoPosition}>
        {/* Translation arrows */}
        <AxisArrow axis="x" color="#ef4444" position={[0, 0, 0]} objectPosition={object.position} onPreviewChange={setPreview} />
        <AxisArrow axis="y" color="#22c55e" position={[0, 0, 0]} objectPosition={object.position} onPreviewChange={setPreview} />
        <AxisArrow axis="z" color="#3b82f6" position={[0, 0, 0]} objectPosition={object.position} onPreviewChange={setPreview} />

        {/* Center sphere */}
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Rotation buttons - HTML overlay */}
        <Html position={[0, 2.5, 0]} center style={{ pointerEvents: 'auto' }}>
          <div className="flex gap-1.5 bg-white rounded-xl shadow-lg border border-slate-200 p-2">
            <span className="text-[9px] text-slate-400 font-medium self-center px-1">ROTATE</span>
            <button
              onClick={handleRotate('x')}
              className="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold flex items-center justify-center transition-all active:scale-90 border border-red-200"
              title="Rotate X (90 degrees)"
            >
              X
            </button>
            <button
              onClick={handleRotate('y')}
              className="w-9 h-9 rounded-lg bg-green-50 hover:bg-green-100 text-green-500 text-xs font-bold flex items-center justify-center transition-all active:scale-90 border border-green-200"
              title="Rotate Y (90 degrees)"
            >
              Y
            </button>
            <button
              onClick={handleRotate('z')}
              className="w-9 h-9 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 text-xs font-bold flex items-center justify-center transition-all active:scale-90 border border-blue-200"
              title="Rotate Z (90 degrees)"
            >
              Z
            </button>
          </div>
        </Html>
      </group>
    </>
  );
};
