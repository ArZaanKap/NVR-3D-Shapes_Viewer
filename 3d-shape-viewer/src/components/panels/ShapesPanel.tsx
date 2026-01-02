import { SHAPE_DEFINITIONS } from '../../types/shapes';
import type { ShapeType } from '../../types/shapes';
import { ShapeThumbnail } from '../shapes/ShapeThumbnail';

interface ShapesPanelProps {
  onDragStart: (e: React.DragEvent, type: ShapeType) => void;
}

export const ShapesPanel = ({ onDragStart }: ShapesPanelProps) => {
  return (
    <div className="hidden md:flex flex-col bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 p-4 w-52">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-semibold text-slate-700">Shapes</h3>
      </div>
      <p className="text-[11px] text-slate-400 mb-4">
        Drag into workspace
      </p>

      {/* Shape grid */}
      <div className="grid grid-cols-2 gap-2">
        {SHAPE_DEFINITIONS.map((def) => (
          <ShapeThumbnail
            key={def.type}
            type={def.type}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
};
