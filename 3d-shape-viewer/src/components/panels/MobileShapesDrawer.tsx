import { useState } from 'react';
import { SHAPE_DEFINITIONS } from '../../types/shapes';
import type { ShapeType } from '../../types/shapes';
import { ShapeThumbnail } from '../shapes/ShapeThumbnail';

interface MobileShapesDrawerProps {
  onDragStart: (e: React.DragEvent, type: ShapeType) => void;
}

export const MobileShapesDrawer = ({ onDragStart }: MobileShapesDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg font-medium hover:bg-blue-600 transition-all active:scale-95"
      >
        {isOpen ? 'Close' : 'Add Shapes'}
      </button>

      {/* Drawer */}
      <div
        className={`
          md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-2xl border-t border-slate-200
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-4 pb-20">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Shapes</h3>
          <div className="grid grid-cols-4 gap-3">
            {SHAPE_DEFINITIONS.map((def) => (
              <ShapeThumbnail
                key={def.type}
                type={def.type}
                onDragStart={onDragStart}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
