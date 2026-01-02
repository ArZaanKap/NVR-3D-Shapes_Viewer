// Grid and scene settings
export const GRID_SIZE = 50;
export const GRID_CELL_SIZE = 1;

// Colors - Light theme, child-friendly
export const COLORS = {
  // Shape colors
  shapeDefault: '#e2e8f0',          // Light grey
  shapeSelected: '#93c5fd',         // Light blue when selected
  shapeFaceHighlight: '#3b82f6',    // Blue highlight
  shapeFaceHighlightGreen: '#22c55e', // Green highlight
  edgeColor: '#1e293b',             // Dark edge for contrast

  // Scene colors
  gridColor: '#cbd5e1',
  gridCellColor: '#e2e8f0',
  background: '#f8fafc',            // Light background

  // Axis colors
  axisX: '#ef4444',                 // Red
  axisY: '#22c55e',                 // Green
  axisZ: '#3b82f6',                 // Blue

  // UI colors
  primary: '#3b82f6',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
};

// Face shading for isometric look
export const FACE_COLORS = {
  top: '#f1f5f9',     // lightest
  front: '#e2e8f0',   // medium
  side: '#cbd5e1',    // darkest
};

// Camera settings - Y-up coordinate system (XZ plane is ground)
export const CAMERA = {
  position: [10, 10, 10] as [number, number, number],
  fov: 50,
  near: 0.1,
  far: 1000,
};

// Rotation increment (90 degrees in radians)
export const ROTATION_INCREMENT = Math.PI / 2;
