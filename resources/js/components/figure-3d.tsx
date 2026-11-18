
'use client'

import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
    ContactShadows,
    Environment,
    Float,
    Html,
    OrbitControls,
    useGLTF,
} from '@react-three/drei'
import { Box3, Vector3, type Group } from 'three'
import { Spinner } from '@/components/ui/spinner'
import { useThree } from '@react-three/fiber'
import { PerspectiveCamera } from 'three'

const TARGET_HEIGHT = 1.6

interface Figure3DProps {
    modelPath: string | null
}

function GLBModel({ modelPath }: { modelPath: string }) {
    const group = useRef<Group>(null)
    const { scene } = useGLTF(modelPath)
    const { camera, size } = useThree()

    const { object, scale, offset, width, height } = useMemo(() => {
        const object = scene.clone(true)

        const box = new Box3().setFromObject(object)
        const dimensions = box.getSize(new Vector3())
        const center = box.getCenter(new Vector3())

        const modelHeight = dimensions.y || 1
        const scale = TARGET_HEIGHT / modelHeight

        return {
            object,
            scale,
            offset: center,
            width: dimensions.x * scale,
            height: dimensions.y * scale,
        }
    }, [scene])

    useEffect(() => {
        const perspectiveCamera = camera as PerspectiveCamera

        const verticalFov = (perspectiveCamera.fov * Math.PI) / 180
        const aspect = size.width / Math.max(size.height, 1)
        const horizontalFov = 2 * Math.atan(
            Math.tan(verticalFov / 2) * aspect,
        )

        const distanceForHeight =
            (height / 2) / Math.tan(verticalFov / 2)

        const distanceForWidth =
            (width / 2) / Math.tan(horizontalFov / 2)

        const distance = Math.max(
            distanceForHeight,
            distanceForWidth,
        ) * 1.2

        camera.position.set(0, 0.3, Math.max(distance, 3))
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()
    }, [camera, size.width, size.height, width, height])

    useFrame((_, delta) => {
        if (group.current) {
            group.current.rotation.y += delta * 0.35
        }
    })

    return (
        <group ref={group}>
            <group
                scale={scale}
                position={[
                    -offset.x * scale,
                    -offset.y * scale,
                    -offset.z * scale,
                ]}
            >
                <primitive object={object} />
            </group>
        </group>
    )
}

/**
 * Процедурная заглушка, если модель не задана
 * или не смогла загрузиться.
 */
function ShadowCreature() {
    const group = useRef<Group>(null)

    useFrame((_, delta) => {
        if (group.current) {
            group.current.rotation.y += delta * 0.35
        }
    })

    return (
        <group ref={group} position={[0, -0.15, 0]}>
            <mesh castShadow>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    color="#141110"
                    roughness={0.55}
                    metalness={0.1}
                />
            </mesh>

            <mesh castShadow position={[0, -0.55, 0]}>
                <sphereGeometry args={[0.78, 64, 64]} />
                <meshStandardMaterial
                    color="#141110"
                    roughness={0.55}
                    metalness={0.1}
                />
            </mesh>

            {[-0.55, 0.55].map((x) => (
                <mesh
                    key={x}
                    castShadow
                    position={[x, 0.95, 0]}
                    rotation={[0, 0, x > 0 ? -0.35 : 0.35]}
                >
                    <coneGeometry args={[0.32, 0.85, 32]} />
                    <meshStandardMaterial
                        color="#141110"
                        roughness={0.55}
                        metalness={0.1}
                    />
                </mesh>
            ))}

            {[-0.34, 0.34].map((x) => (
                <mesh key={x} position={[x, 0.2, 0.86]}>
                    <sphereGeometry args={[0.12, 32, 32]} />
                    <meshStandardMaterial
                        color="#AA141E"
                        emissive="#AA141E"
                        emissiveIntensity={2.4}
                        toneMapped={false}
                    />
                </mesh>
            ))}

            <mesh
                position={[0, -0.5, 0.72]}
                rotation={[0.3, 0, 0]}
            >
                <torusGeometry args={[0.12, 0.03, 16, 48]} />
                <meshStandardMaterial
                    color="#c9c3b8"
                    roughness={0.25}
                    metalness={0.9}
                />
            </mesh>
        </group>
    )
}

class ModelErrorBoundary extends Component<
    { fallback: ReactNode; children: ReactNode },
    { hasError: boolean }
> {
    state = {
        hasError: false,
    }

    static getDerivedStateFromError() {
        return {
            hasError: true,
        }
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback
        }

        return this.props.children
    }
}

function LoadingModel() {
    return (
        <Html
            center
            style={{
                width: '100px',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Spinner className="size-8 text-primary" />
        </Html>
    )
}

export function Figure3D({ modelPath }: Figure3DProps) {
    // Если у скина нет модели, показываем заглушку.
    const normalizedPath = modelPath
        ? `/storage/${modelPath.replace(/^\/+/, '')}`
        : null

    return (
        // <Canvas
        //     shadows
        //     dpr={[1, 2]}
        //     camera={{
        //         position: [0, 0.3, 4.6],
        //         fov: 42,
        //     }}
        //     gl={{
        //         antialias: true,
        //         alpha: true,
        //     }}
        // >
        <Canvas
            shadows
            dpr={[1, 1.5]}
            performance={{ min: 0.5 }}
            camera={{
                position: [0, 0.3, 4.6],
                fov: 42,
            }}
            gl={{
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance',
            }}
        >
            <ambientLight intensity={0.35} />

            <spotLight
                position={[4, 6, 3]}
                angle={0.5}
                penumbra={1}
                intensity={40}
                color="#fff4e8"
                castShadow
            />

            <pointLight
                position={[-4, -1, -3]}
                intensity={8}
                color="#AA141E"
            />

            <Suspense fallback={<LoadingModel />}>
                <Float
                    speed={1.4}
                    rotationIntensity={0.3}
                    floatIntensity={0.15}
                >
                    {normalizedPath ? (
                        <ModelErrorBoundary
                            key={normalizedPath}
                            fallback={<ShadowCreature />}
                        >
                            <GLBModel modelPath={normalizedPath} />
                        </ModelErrorBoundary>
                    ) : (
                        <ShadowCreature />
                    )}
                </Float>

                {/* <ContactShadows
                    position={[0, -1.6, 0]}
                    opacity={0.55}
                    scale={9}
                    blur={2.6}
                    far={4}
                /> */}
                <ContactShadows
                    position={[0, -1.6, 0]}
                    opacity={0.55}
                    scale={5}
                    blur={2}
                    far={3}
                    resolution={256}
                />

                <Environment
                    files="/hdr/empty_warehouse_01_1k.hdr"
                    background={false}
                    environmentIntensity={0.8}
                />
            </Suspense>

            <OrbitControls
                enablePan={false}
                enableZoom={false}
                minPolarAngle={Math.PI / 2.6}
                maxPolarAngle={Math.PI / 1.9}
            />
        </Canvas>
    )
}
