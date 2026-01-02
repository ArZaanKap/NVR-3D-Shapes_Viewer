import { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Grid } from './canvas/Grid';
import { AxisIndicator } from './canvas/AxisIndicator';
import { Lighting } from './canvas/Lighting';
import { ShapeFactory } from './shapes/ShapeFactory';
import { ShapesPanel } from './panels/ShapesPanel';
import { MobileShapesDrawer } from './panels/MobileShapesDrawer';
import { ToolsPanel } from './panels/ToolsPanel';
import { ViewCube } from './gizmos/ViewCube';
import { useSceneStore, type CameraView } from '../stores/sceneStore';
import type { ShapeType } from '../types/shapes';
import { BaseShape } from './shapes/BaseShape';
import { checkCollision, getGroundY } from '../utils/collision';
import { getShapeCenterOffset } from '../utils/geometryBuilder';

// Camera configurations for each view (Z-up coordinate system, XY ground plane)
const CAMERA_CONFIGS: Record<CameraView, {
  position: [number, number, number];
  up: [number, number, number];
  target: [number, number, number];
}> = {
  perspective: { position: [10, -10, 10], up: [0, 0, 1], target: [0, 0, 1] },
  front: { position: [20, 0, 3], up: [0, 0, 1], target: [0, 0, 1] },      // Looking along -X
  back: { position: [-20, 0, 3], up: [0, 0, 1], target: [0, 0, 1] },     // Looking along +X
  left: { position: [0, 20, 3], up: [0, 0, 1], target: [0, 0, 1] },      // Looking along -Y
  right: { position: [0, -20, 3], up: [0, 0, 1], target: [0, 0, 1] },    // Looking along +Y
  top: { position: [0.01, 0, 25], up: [0, 1, 0], target: [0, 0, 0] },    // Looking along -Z
  bottom: { position: [0, 0, -20], up: [0, -1, 0], target: [0, 0, 0] },  // Looking along +Z
};

// Camera controller with smooth transitions
const CameraController = () => {
  const { set, size, gl, camera } = useThree();
  const controlsRef = useRef<any>(null);
  const cameraView = useSceneStore((state) => state.cameraView);
  const setCameraView = useSceneStore((state) => state.setCameraView);
  const isDragging = useSceneStore((state) => state.isDragging);
  const prevView = useRef<CameraView | null>(null);

  // Animation state
  const isAnimating = useRef(false);
  const skipNextAnimation = useRef(false);
  const isUserRotating = useRef(false);  // Track if user is actively rotating camera
  const targetPosition = useRef(new THREE.Vector3(10, 10, 10));
  const targetUp = useRef(new THREE.Vector3(0, 1, 0));
  const targetLookAt = useRef(new THREE.Vector3(0, 1, 0));
  const animationProgress = useRef(0);

  // Create perspective camera (created once, aspect updated on resize) - Z-up
  const perspectiveCamera = useMemo(() => {
    const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    cam.position.set(10, -10, 10);
    cam.up.set(0, 0, 1);
    cam.lookAt(0, 0, 1);
    return cam;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update camera aspect on resize
  useEffect(() => {
    const aspect = size.width / size.height;
    perspectiveCamera.aspect = aspect;
    perspectiveCamera.updateProjectionMatrix();
  }, [size, perspectiveCamera]);

  // Start animation when view changes
  useEffect(() => {
    if (prevView.current === cameraView) return;

    // Skip animation if triggered by manual camera rotation
    if (skipNextAnimation.current) {
      skipNextAnimation.current = false;
      prevView.current = cameraView;
      return;
    }

    const config = CAMERA_CONFIGS[cameraView];
    targetPosition.current.set(...config.position);
    targetUp.current.set(...config.up);
    targetLookAt.current.set(...config.target);

    // Start animation
    isAnimating.current = true;
    animationProgress.current = 0;

    // Set the camera on first render
    if (!prevView.current) {
      perspectiveCamera.position.copy(targetPosition.current);
      perspectiveCamera.up.copy(targetUp.current);
      perspectiveCamera.lookAt(targetLookAt.current);
      perspectiveCamera.updateProjectionMatrix();
      set({ camera: perspectiveCamera });

      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLookAt.current);
        controlsRef.current.update();
      }
      isAnimating.current = false;
    }

    prevView.current = cameraView;
  }, [cameraView, perspectiveCamera, set]);

  // Smooth camera animation using useFrame
  useFrame((_, delta) => {
    if (!isAnimating.current) return;

    // Smooth interpolation speed (higher = faster)
    const lerpFactor = 1 - Math.pow(0.001, delta);

    // Lerp position
    perspectiveCamera.position.lerp(targetPosition.current, lerpFactor);

    // Lerp up vector
    perspectiveCamera.up.lerp(targetUp.current, lerpFactor);
    perspectiveCamera.up.normalize();

    // Update controls target smoothly
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, lerpFactor);
      controlsRef.current.update();
    }

    perspectiveCamera.updateProjectionMatrix();

    // Check if animation is complete
    const positionDist = perspectiveCamera.position.distanceTo(targetPosition.current);
    if (positionDist < 0.01) {
      // Snap to final position
      perspectiveCamera.position.copy(targetPosition.current);
      perspectiveCamera.up.copy(targetUp.current);

      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLookAt.current);
        controlsRef.current.update();
      }

      isAnimating.current = false;
    }
  });

  // Store the controls reference
  useEffect(() => {
    if (controlsRef.current) {
      set({ controls: controlsRef.current });
    }
  }, [set]);

  // Disable controls when dragging
  const canPan = !isDragging;

  // Custom zoom-to-cursor functionality
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isDragging) return;
      if (!controlsRef.current) return;

      e.preventDefault();

      // Get mouse position in NDC
      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      // Get ray direction from camera through mouse
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      // Dolly amount based on distance to orbit target (5% per scroll for smooth zoom)
      const dollyScale = e.deltaY > 0 ? 0.05 : -0.05;
      const currentDistance = camera.position.distanceTo(controlsRef.current.target);

      // Clamp to min/max distance
      const minDistance = 3;
      const maxDistance = 50;
      const newDistance = currentDistance * (1 + dollyScale);
      if (newDistance < minDistance || newDistance > maxDistance) return;

      const dollyDistance = currentDistance * dollyScale;

      // Move camera along ray direction (towards cursor point)
      const moveDir = raycaster.ray.direction.clone().multiplyScalar(-dollyDistance);
      camera.position.add(moveDir);

      // Also move orbit target to maintain view direction (zoom-to-cursor effect)
      controlsRef.current.target.add(moveDir);
      controlsRef.current.update();
    };

    gl.domElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => gl.domElement.removeEventListener('wheel', handleWheel);
  }, [gl, camera, isDragging]);

  // Stop animation when user STARTS interacting (preserves smooth view transitions)
  const handleControlsStart = () => {
    // Only stop animation when user begins manual interaction
    isAnimating.current = false;
    isUserRotating.current = true;  // Mark that user is actively interacting
    // NOTE: Removed target reset - it was causing camera shifts on every click
  };

  // Reset to perspective view when user manually rotates camera
  const handleControlsChange = () => {
    // Only reset to perspective if user is actually rotating the camera
    if (isUserRotating.current && cameraView !== 'perspective') {
      skipNextAnimation.current = true;
      setCameraView('perspective');
    }
  };

  // End of user interaction
  const handleControlsEnd = () => {
    isUserRotating.current = false;
  };

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={canPan}
      enableZoom={false}  // Disabled - using custom zoom-to-cursor instead
      enableRotate={true}
      minDistance={3}
      maxDistance={50}
      makeDefault
      mouseButtons={{
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      }}
      onStart={handleControlsStart}
      onChange={handleControlsChange}
      onEnd={handleControlsEnd}
    />
  );
};

// Preview shape with collision detection
const DropPreview = ({
  draggedType,
  previewPosition,
  hasCollision,
}: {
  draggedType: ShapeType | null;
  previewPosition: THREE.Vector3 | null;
  hasCollision: boolean;
}) => {
  if (!draggedType || !previewPosition) return null;

  return (
    <BaseShape
      type={draggedType}
      position={previewPosition}
      rotation={new THREE.Euler(0, 0, 0)}
      isPreview={true}
      isColliding={hasCollision}
    />
  );
};

// Click handler to deselect (XY plane at Z=0) - Z-up coordinate system
const ClickHandler = () => {
  const selectObject = useSceneStore((state) => state.selectObject);

  return (
    <mesh
      position={[0, 0, -0.01]}
      rotation={[0, 0, 0]}
      onClick={(e) => {
        // Check if we clicked directly on the ground plane
        if (e.object.type === 'Mesh') {
          selectObject(null);
        }
      }}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
};

export const Workspace = () => {
  const addObject = useSceneStore((state) => state.addObject);
  const objects = useSceneStore((state) => state.objects);
  const selectedId = useSceneStore((state) => state.selectedId);
  const selectObject = useSceneStore((state) => state.selectObject);
  const removeObject = useSceneStore((state) => state.removeObject);
  const setTool = useSceneStore((state) => state.setTool);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [draggedType, setDraggedType] = useState<ShapeType | null>(null);
  const [previewPosition, setPreviewPosition] = useState<THREE.Vector3 | null>(null);
  const [hasCollision, setHasCollision] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          // ESC - Deselect and return to cursor mode
          selectObject(null);
          setTool('cursor');
          break;
        case 'Delete':
        case 'Backspace':
          // DEL/Backspace - Delete selected shape
          if (selectedId) {
            e.preventDefault(); // Prevent browser back navigation
            removeObject(selectedId);
          }
          break;
        case 'r':
        case 'R':
          // R - Switch to rotate mode
          setTool('rotate');
          break;
        case 't':
        case 'T':
          // T - Switch to translate mode
          setTool('translate');
          break;
        case 'c':
        case 'C':
          // C - Switch to cursor mode
          setTool('cursor');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, selectObject, removeObject, setTool]);

  const handleDragStart = (e: React.DragEvent, type: ShapeType) => {
    setDraggedType(type);
    e.dataTransfer.setData('shapeType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    if (canvasRef.current && draggedType) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      // Get shape's center offset to calculate correct snap position
      // Odd dimensions need half-integer positions, even dimensions need integer positions
      const offset = getShapeCenterOffset(draggedType);
      const rawX = x * 5;
      const rawY = -y * 5; // Negate Y for correct screen mapping
      // Snap so that (position + offset) lands on integer → corners on grid intersections
      const worldX = Math.round(rawX + offset.x) - offset.x;
      const worldY = Math.round(rawY + offset.y) - offset.y;

      // Get the correct Z position so shape sits ON the grid (Z-up)
      const groundZ = getGroundY(draggedType, new THREE.Euler(0, 0, 0)); // Will rename to getGroundZ
      const newPosition = new THREE.Vector3(worldX, worldY, groundZ);

      setPreviewPosition(newPosition);

      // Check for collision
      const collision = checkCollision(
        draggedType,
        newPosition,
        new THREE.Euler(0, 0, 0),
        objects
      );
      setHasCollision(collision);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('shapeType') as ShapeType;

    // Only place if no collision
    if (type && previewPosition && !hasCollision) {
      addObject(type, previewPosition);
    }

    setDraggedType(null);
    setPreviewPosition(null);
    setHasCollision(false);
  };

  const handleDragLeave = () => {
    setPreviewPosition(null);
    setHasCollision(false);
  };

  const handleDragEnd = () => {
    setDraggedType(null);
    setPreviewPosition(null);
    setHasCollision(false);
  };

  return (
    <div className="flex-1 flex relative overflow-hidden">
      {/* Left Panel - Shapes (Desktop) */}
      <div className="absolute left-4 top-4 z-10">
        <ShapesPanel onDragStart={handleDragStart} />
      </div>

      {/* Top Center - Tools */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <ToolsPanel />
      </div>

      {/* Mobile Shapes Drawer */}
      <MobileShapesDrawer onDragStart={handleDragStart} />

      {/* View Cube - Top Right */}
      <ViewCube />

      {/* 3D Canvas */}
      <div
        ref={canvasRef}
        className="flex-1"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
      >
        <Canvas
          camera={{
            position: [10, -10, 10],
            fov: 50,
            near: 0.1,
            far: 1000,
            up: [0, 0, 1],
          }}
          style={{ background: '#f8fafc' }}
          orthographic={false}
        >
          <Lighting />
          <Grid />
          <AxisIndicator />
          <CameraController />
          <ShapeFactory />
          <DropPreview
            draggedType={draggedType}
            previewPosition={previewPosition}
            hasCollision={hasCollision}
          />
          <ClickHandler />
        </Canvas>
      </div>

    </div>
  );
};
