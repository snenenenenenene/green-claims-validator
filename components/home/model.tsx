import React, { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export function Model(props: any) {
  const { nodes, materials } = useGLTF("/models/wash_buddy/scene.gltf");
  const groupRef = useRef();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      // Adjust these values to change the sensitivity of the rotation
      const rotationFactor = 0.1;
      const xRotation =
        (mousePosition.y / window.innerHeight - 0.5) * rotationFactor;
      const yRotation =
        (mousePosition.x / window.innerWidth - 0.5) * rotationFactor;

      groupRef.current.rotation.x = xRotation;
      groupRef.current.rotation.y = yRotation;
    }
  });

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <group position={[0, 1, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_4.geometry}
          material={materials.Material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_5.geometry}
          material={materials["Material.001"]}
        />
      </group>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_7.geometry}
        material={materials.Material}
        position={[0, 0.018, 0.395]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_9.geometry}
        material={materials.Material}
        position={[0, 1.752, 0.971]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

useGLTF.preload("/models/wash_buddy/scene.gltf");
