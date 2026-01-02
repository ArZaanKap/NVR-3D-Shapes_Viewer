export const Lighting = () => {
  return (
    <>
      {/* Ambient light for soft base illumination */}
      <ambientLight intensity={0.6} color="#ffffff" />

      {/* Main directional light - warm sunlight from top-right-front */}
      <directionalLight
        position={[8, 12, 8]}
        intensity={1.0}
        color="#fff8f0"
        castShadow={false}
      />

      {/* Fill light from opposite side - cooler tone */}
      <directionalLight
        position={[-6, 8, -6]}
        intensity={0.4}
        color="#f0f4ff"
        castShadow={false}
      />

      {/* Soft top light for even illumination */}
      <directionalLight
        position={[0, 15, 0]}
        intensity={0.3}
        color="#ffffff"
        castShadow={false}
      />

      {/* Rim light for depth */}
      <directionalLight
        position={[-10, 5, 10]}
        intensity={0.2}
        color="#e0e7ff"
        castShadow={false}
      />
    </>
  );
};
