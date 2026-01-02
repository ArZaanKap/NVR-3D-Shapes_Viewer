import { useSceneStore, type CameraView } from '../../stores/sceneStore';

export const ViewCube = () => {
  const cameraView = useSceneStore((state) => state.cameraView);
  const setCameraView = useSceneStore((state) => state.setCameraView);

  const views: { label: string; view: CameraView; color: string }[] = [
    { label: 'Default', view: 'perspective', color: 'blue' },
    { label: 'Front', view: 'front', color: 'slate' },
    { label: 'Back', view: 'back', color: 'slate' },
    { label: 'Left', view: 'left', color: 'slate' },
    { label: 'Right', view: 'right', color: 'slate' },
    { label: 'Top', view: 'top', color: 'slate' },
    { label: 'Bottom', view: 'bottom', color: 'slate' },
  ];

  return (
    <div className="absolute right-4 bottom-4 md:top-1/2 md:bottom-auto md:-translate-y-1/2 z-20">
      <div className="flex flex-row md:flex-col gap-1.5 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 p-2.5">
        {/* Header - hidden on mobile */}
        <div className="hidden md:block text-[10px] text-center text-slate-400 font-semibold uppercase tracking-wider px-1">
          View
        </div>

        {/* View buttons */}
        <div className="flex flex-row md:flex-col gap-1.5">
          {views.map((v) => (
            <button
              key={v.view}
              onClick={() => setCameraView(v.view)}
              className={`
                min-w-[44px] min-h-[44px] px-3 rounded-xl flex items-center justify-center
                text-xs font-semibold transition-all duration-200 active:scale-95
                ${cameraView === v.view
                  ? v.color === 'blue'
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-700 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
                }
              `}
              title={`View from ${v.label.toLowerCase()}`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Hint - hidden on mobile */}
        <div className="hidden md:block text-[9px] text-center text-slate-400 mt-1 px-1">
          Drag canvas to orbit
        </div>
      </div>
    </div>
  );
};
