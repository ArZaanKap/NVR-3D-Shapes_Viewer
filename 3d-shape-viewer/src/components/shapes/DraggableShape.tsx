import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useSceneStore } from '../../stores/sceneStore';
import { BaseShape } from './BaseShape';
import { TranslationGizmo, RotationGizmo } from '../gizmos/ShapeGizmo';
import { checkCollision, getGroundY } from '../../utils/collision';
import { getShapeCenterOffset } from '../../utils/geometryBuilder';
import type { SceneObject } from '../../types/shapes';

interface DraggableShapeProps {
  object: SceneObject;
  isSelected: boolean;
}

export const DraggableShape = ({ object, isSelected }: DraggableShapeProps) => {
  const { camera, gl } = useThree();
  const [hovered, setHovered] = useState(false);
  const [preview, setPreview] = useState<{ position: THREE.Vector3; isColliding: boolean } | null>(null);
  const dragStart = useRef<THREE.Vector3 | null>(null);
  const originalPosition = useRef<THREE.Vector3 | null>(null);

  const selectObject = useSceneStore((state) => state.selectObject);
  const updateObjectPosition = useSceneStore((state) => state.updateObjectPosition);
  const setIsDragging = useSceneStore((state) => state.setIsDragging);
  const objects = useSceneStore((state) => state.objects);
  const activeTool = useSceneStore((state) => state.activeTool);

  // Handle click to select
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectObject(object.id);
  };

  // Handle pointer down to start dragging (only if already selected and in translate mode)
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!isSelected || activeTool !== 'translate') return;

    e.stopPropagation();

    // Start dragging
    setIsDragging(true);
    dragStart.current = e.point.clone();
    originalPosition.current = object.position.clone();
    gl.domElement.style.cursor = 'grabbing';

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragStart.current || !originalPosition.current) return;

      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((moveEvent.clientX - rect.left) / rect.width) * 2 - 1,
        -((moveEvent.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      // Create a horizontal plane at the object's Z position (Z-up coordinate system)
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -originalPosition.current.z);
      const intersect = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersect);

      if (intersect) {
        // Use offset-aware snapping (consistent with Workspace.tsx and ShapeGizmo.tsx)
        const offset = getShapeCenterOffset(object.type);
        const newX = Math.round(intersect.x + offset.x) - offset.x;
        const newY = Math.round(intersect.y + offset.y) - offset.y;

        // Calculate Z position so shape sits on ground
        const groundZ = getGroundY(object.type, object.rotation);
        const newPos = new THREE.Vector3(newX, newY, groundZ);

        // Check collision
        const hasCollision = checkCollision(object.type, newPos, object.rotation, objects, object.id);

        if (!hasCollision) {
          // No collision - update position and clear preview
          updateObjectPosition(object.id, newPos);
          setPreview(null);
        } else {
          // Collision - show preview at invalid position
          setPreview({ position: newPos, isColliding: true });
        }
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      gl.domElement.style.cursor = 'auto';
      dragStart.current = null;
      originalPosition.current = null;
      // Clear preview on mouse up
      setPreview(null);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <group>
      {/* Preview shape for invalid (colliding) positions during direct drag */}
      {preview && preview.isColliding && (
        <BaseShape
          type={object.type}
          position={preview.position}
          rotation={object.rotation}
          isPreview={true}
          isColliding={true}
        />
      )}

      <BaseShape
        type={object.type}
        position={object.position}
        rotation={object.rotation}
        isSelected={isSelected}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />

      {/* Show gizmo based on active tool */}
      {isSelected && activeTool === 'translate' && <TranslationGizmo object={object} />}
      {isSelected && activeTool === 'rotate' && <RotationGizmo object={object} />}

      {/* Hover indicator - only show when not selected */}
      {hovered && !isSelected && (
        <Html position={[object.position.x, object.position.y + 1.5, object.position.z]} center>
          <div className="text-[10px] text-slate-500 bg-white px-2.5 py-1.5 rounded-lg shadow-md border border-slate-200 font-medium whitespace-nowrap">
            Click to select
          </div>
        </Html>
      )}

      {/* Tool hint when selected but in cursor mode */}
      {isSelected && activeTool === 'cursor' && (
        <Html position={[object.position.x, object.position.y + 1.5, object.position.z]} center>
          <div className="text-[10px] text-slate-500 bg-white px-2.5 py-1.5 rounded-lg shadow-md border border-slate-200 font-medium whitespace-nowrap">
            Press <span className="text-blue-500 font-bold">R</span> to rotate or <span className="text-blue-500 font-bold">T</span> to move
          </div>
        </Html>
      )}
    </group>
  );
};
