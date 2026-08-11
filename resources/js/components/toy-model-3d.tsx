"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import {
    OrbitControls,
    Environment,
    useGLTF,
} from "@react-three/drei"

function Model() {
    const { scene } = useGLTF("/models/Model.glb")

    return (
        <primitive
            object={scene}
            scale={2.8}
            position={[0, -1.2, 0]}
            rotation={[0, -Math.PI / 6, 0]}
        />
    )
}

export function ToyModel3D() {
    return (
        <div className="w-full h-[420px]">
            <Canvas
                camera={{
                    position: [0, 0, 5],
                    fov: 45,
                }}
            >
                <ambientLight intensity={1} />

                <directionalLight
                    position={[3, 3, 3]}
                    intensity={2}
                />

                <Suspense fallback={null}>
                    <Model />
                    <Environment preset="studio" />
                </Suspense>

                <OrbitControls
                    enableZoom={false}
                    autoRotate
                    autoRotateSpeed={0.8}
                />
            </Canvas>
        </div>
    )
}

useGLTF.preload("/models/Model.glb")
