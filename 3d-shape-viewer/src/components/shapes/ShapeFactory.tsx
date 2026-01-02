import { useSceneStore } from '../../stores/sceneStore';
import { DraggableShape } from './DraggableShape';

export const ShapeFactory = () => {
  const objects = useSceneStore((state) => state.objects);
  const selectedId = useSceneStore((state) => state.selectedId);

  return (
    <>
      {objects.map((obj) => (
        <DraggableShape
          key={obj.id}
          object={obj}
          isSelected={obj.id === selectedId}
        />
      ))}
    </>
  );
};
