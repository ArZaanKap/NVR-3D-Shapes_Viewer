import { useState } from 'react';
import { useSceneStore } from '../../stores/sceneStore';
import { ConfirmModal } from '../ui/ConfirmModal';
import type { ToolType } from '../../types/shapes';

export const ToolsPanel = () => {
  const selectedId = useSceneStore((state) => state.selectedId);
  const activeTool = useSceneStore((state) => state.activeTool);
  const removeObject = useSceneStore((state) => state.removeObject);
  const resetScene = useSceneStore((state) => state.resetScene);
  const setTool = useSceneStore((state) => state.setTool);
  const selectObject = useSceneStore((state) => state.selectObject);
  const objects = useSceneStore((state) => state.objects);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleDelete = () => {
    if (selectedId) {
      removeObject(selectedId);
    }
  };

  const handleToolClick = (tool: ToolType) => {
    if (tool === 'cursor') {
      selectObject(null);
    }
    setTool(tool);
  };

  const toolButtons: { tool: ToolType; label: string; icon: React.ReactNode; shortcut: string }[] = [
    {
      tool: 'cursor',
      label: 'Select',
      shortcut: 'C',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
    },
    {
      tool: 'rotate',
      label: 'Rotate',
      shortcut: 'R',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      tool: 'translate',
      label: 'Move',
      shortcut: 'T',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center gap-1 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200 p-1.5">
        {/* Mode buttons */}
        {toolButtons.map((btn) => (
          <button
            key={btn.tool}
            onClick={() => handleToolClick(btn.tool)}
            className={`
              min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${activeTool === btn.tool
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95'
              }
            `}
            title={`${btn.label} (${btn.shortcut})`}
          >
            {btn.icon}
            <span className="hidden sm:inline text-[10px]">{btn.label}</span>
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-8 bg-slate-200 mx-1" />

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={!selectedId}
          className={`
            min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            ${selectedId
              ? 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-95'
              : 'bg-slate-50 text-slate-300 cursor-not-allowed'
            }
          `}
          title="Delete selected (Del)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="hidden sm:inline text-[10px]">Delete</span>
        </button>

        {/* Reset button */}
        <button
          onClick={() => setShowResetConfirm(true)}
          disabled={objects.length === 0}
          className={`
            min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            ${objects.length > 0
              ? 'bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95'
              : 'bg-slate-50 text-slate-300 cursor-not-allowed'
            }
          `}
          title="Clear all shapes"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="hidden sm:inline text-[10px]">Clear All</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Clear All Shapes?"
        message="This will remove all shapes from your workspace. You cannot undo this action."
        confirmText="Clear All"
        cancelText="Keep Building"
        variant="warning"
        onConfirm={() => {
          resetScene();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  );
};
