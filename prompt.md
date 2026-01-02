# 3D Shape Viewer - Project Brief

## Overview
I'm looking to build a website that works on laptop, PC, iPad and phones seamlessly. It will be a tool to visualise 3D shapes to help students prepare for the nonverbal reasoning section of the UK's 11+ exam.

## Design Philosophy
- The website should be **minimal and fully functional**
- Just the title with the tool underneath
- Example attached for reference

## Core Features

### 3D World
- A simple CAD-like blank world where I can drag and drop basic 3D shapes
- **Clipping mechanism:** Each new shape can attach to a face of ones already in the world
- Preview of where the new shape will attach while dragging (faces get temporary colour instead of default grey)

### Controls
- **Reset button:** Clear the world
- **Delete button:** Delete a shape when selected
- **Cursor button:** At the top to help deselect anything and return to normal viewing mode

### Camera/Viewing
After arranging shapes into a compound shape, view it from different angles:

1. **ViewCube** (like Fusion 360 top-right corner)
   - Exact views from front, side, back, etc. when clicking sections
   - Small text labels: front, back, right, left

2. **Orbit Control**
   - Drag the world to rotate the viewing camera

3. **Zoom**
   - Zoom in and out

### User Authentication
- Gmail login to start
- Keep record of users
- Ask one question: "What's your nickname?" (so we can greet them)
- Remember the nickname - only ask once

### World Features
- **XYZ axis** at origin (small)
- Shapes **snap to world grid**
- **Rotation and translation tools** when selecting a block (gimbal like Fusion 360)

## Available Shapes
All shapes seen in attached image:

### Cuboids
- 1×1×1
- 1×1×2
- 1×1×3

### L-Shapes
- Short
- Long

### T-Shapes
- Short
- Long

### Shapes Panel
- Must have **3D thumbnails** for each shape

## Visual Style

### Outlines
- **Bold black outline** for each edge of each shape
- Helps distinguish blocks that make up the larger assembled shape

### Rotation
- **90-degree increments only**
- Rotation UI should be **child-friendly**

---

*Any other questions?*
