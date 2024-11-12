import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "react-three-fiber";

export function Earth(props: any) {
  const {
    nodes,
    materials,
  }: {
    nodes: any;
    materials: any;
  } = useGLTF("/models/earth.glb");
  const groupRef = useRef<any>();
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;

  const [targetPosition, setTargetPosition] = useState([0, 0, 0]);
  const [currentPosition, setCurrentPosition] = useState([0, 0, 0]);

  // Initial animation using GSAP
  useEffect(() => {
    if (groupRef.current) {
      gsap.fromTo(
        groupRef.current.scale,
        { x: 0.1, y: 0.1, z: 0.1 },
        { x: 2, y: 2, z: 2, duration: 2, ease: "power2.out" },
      );

      gsap.fromTo(
        groupRef.current.rotation,
        { y: 0 },
        { y: Math.PI * 4, duration: 2, ease: "power2.out" },
      );
    }
  }, []);

  // Rotation logic
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003; // Adjust the speed of rotation as needed

      // Smooth transition towards the target position
      const dampingFactor = 0.1;
      setCurrentPosition((prevPosition) => {
        const newPosition = prevPosition.map(
          (coord, index) =>
            coord + (targetPosition[index] - coord) * dampingFactor,
        );
        groupRef.current.position.set(...newPosition);
        return newPosition;
      });
    }
  });

  // Cursor tracking logic
  const handleMouseMove = (event) => {
    const x = ((event.clientX / size.width) * 2 - 1) * 0.1; // Scale down the movement range
    const y = -((event.clientY / size.height) * 2 - 1) * 0.1; // Scale down the movement range
    setTargetPosition([x, y, 0]);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [size.width, size.height]);

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <group>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere002.geometry}
          material={materials["Material.009"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere002_1.geometry}
          material={materials["Material.008"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere002_2.geometry}
          material={materials["Material.010"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere002_3.geometry}
          material={materials["Material.005"]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/models/earth.glb");
