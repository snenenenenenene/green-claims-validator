import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';

export function Forest(props) {
	const { nodes, materials } = useGLTF('/models/forest/LP_Forest.glb');
	const groupRef = useRef();
	const { size, viewport } = useThree();
	const aspect = size.width / viewport.width;

	const [targetPosition, setTargetPosition] = useState([0, -5, 0]);
	const [currentPosition, setCurrentPosition] = useState([0, -5, 0]);

	// Initial animation using GSAP
	useEffect(() => {
		if (groupRef.current) {
			gsap.fromTo(
				groupRef.current.scale,
				{ x: 0.1, y: 0.1, z: 0.1 },
				{ x: 1, y: 1, z: 1, duration: 2, ease: "power2.out" }
			);

			gsap.fromTo(
				groupRef.current.rotation,
				{ y: 0 },
				{ y: Math.PI * 0.1, duration: 2, ease: "power2.out" }
			);
		}
	}, []);

	// Cursor tracking and rotation logic
	useFrame((state, delta) => {
		if (groupRef.current) {
			// Subtle continuous rotation
			groupRef.current.rotation.y += 0.0005;

			// Smooth transition towards the target position
			const dampingFactor = 0.02; // Reduced for slower movement
			setCurrentPosition((prevPosition) => {
				const newPosition = prevPosition.map(
					(coord, index) => coord + (targetPosition[index] - coord) * dampingFactor
				);
				groupRef.current.position.set(
					newPosition[0],
					newPosition[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.02, // Reduced bobbing
					newPosition[2]
				);
				return newPosition;
			});
		}
	});

	// Cursor tracking logic
	const handleMouseMove = (event) => {
		const x = ((event.clientX / size.width) * 2 - 1) * 0.5; // Reduced range of movement
		const y = -((event.clientY / size.height) * 2 - 1) * 0.5; // Reduced range of movement
		setTargetPosition([x, y - 30, 0]); // Keeping the forest lower
	};

	useEffect(() => {
		window.addEventListener("mousemove", handleMouseMove);
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, [size.width, size.height]);

	return (
		<group ref={groupRef} {...props} dispose={null}>
			<mesh
				castShadow
				receiveShadow
				geometry={nodes.ForestGround001.geometry}
				material={materials.Textures}>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Bushes001.geometry}
					material={materials.Textures}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Rocks001.geometry}
					material={materials.Textures}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Trees001.geometry}
					material={materials.Textures}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Water001.geometry}
					material={materials.Textures}
				/>
			</mesh>
		</group>
	);
}

useGLTF.preload('/models/forest/LP_Forest.glb');