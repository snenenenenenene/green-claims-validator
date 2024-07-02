import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export function Model(props: any) {
  const { nodes, materials } = useGLTF("/models/wash_buddy/scene.gltf");
  return (
    <group {...props} dispose={null}>
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
