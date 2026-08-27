'use client'

import { Component, Suspense, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
    ContactShadows,
    Environment,
    Float,
    Html,
    OrbitControls,
    useGLTF,
} from "@react-three/drei"
import { Box3, Vector3, type Group } from 'three'
import { Spinner } from "@/components/ui/spinner"

/**
 * Путь к твоей модели. Положи файл в `public/models/Model.glb`
 * (в Laravel + Inertia — тоже `public/models/Model.glb`).
 * Меняешь только эту строку, если имя/путь другие.
 */
const MODEL_URL = '/models/Model.glb'

/**
 * Загрузка реального .glb: клонирует сцену, авто-центрирует и
 * масштабирует под сцену (целевой размер ~2.4 юнита по большей стороне),
 * и медленно вращает так же, как заглушка.
 */
function GLBModel() {
    const group = useRef<Group>(null)
    const { scene } = useGLTF(MODEL_URL)

    const { object, offset, scale } = useMemo(() => {
        const object = scene.clone(true)
        const box = new Box3().setFromObject(object)
        const size = box.getSize(new Vector3())
        const center = box.getCenter(new Vector3())
        const maxAxis = Math.max(size.x, size.y, size.z) || 1
        const scale = 2.4 / maxAxis
        return { object, offset: center, scale }
    }, [scene])

    useFrame((_, delta) => {
        if (group.current) group.current.rotation.y += delta * 0.35
    })

    return (
        <group ref={group} position={[0, 0, 0]}>
            <group scale={scale} position={[-offset.x * scale, -offset.y * scale, -offset.z * scale]}>
                <primitive object={object} />
            </group>
        </group>
    )
}

/**
 * Процедурная заглушка DROPZERO "Shadow" — используется как fallback,
 * пока в проекте нет файла модели (или если .glb не загрузился).
 */
function ShadowCreature() {
    const group = useRef<Group>(null)

    useFrame((_, delta) => {
        if (group.current) group.current.rotation.y += delta * 0.35
    })

    return (
        <group ref={group} position={[0, -0.15, 0]}>
            {/* body */}
            <mesh castShadow position={[0, 0, 0]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial color="#141110" roughness={0.55} metalness={0.1} />
            </mesh>

            {/* lower body to make it egg-shaped */}
            <mesh castShadow position={[0, -0.55, 0]}>
                <sphereGeometry args={[0.78, 64, 64]} />
                <meshStandardMaterial color="#141110" roughness={0.55} metalness={0.1} />
            </mesh>

            {/* ears */}
            {[-0.55, 0.55].map((x) => (
                <mesh key={x} castShadow position={[x, 0.95, 0]} rotation={[0, 0, x > 0 ? -0.35 : 0.35]}>
                    <coneGeometry args={[0.32, 0.85, 32]} />
                    <meshStandardMaterial color="#141110" roughness={0.55} metalness={0.1} />
                </mesh>
            ))}

            {/* eyes */}
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

            {/* pendant */}
            <mesh position={[0, -0.5, 0.72]} rotation={[0.3, 0, 0]}>
                <torusGeometry args={[0.12, 0.03, 16, 48]} />
                <meshStandardMaterial color="#c9c3b8" roughness={0.25} metalness={0.9} />
            </mesh>
        </group>
    )
}

/**
 * Ловит ошибку загрузки .glb (например, файл ещё не добавлен)
 * и показывает процедурную заглушку вместо падения сцены.
 */
class ModelErrorBoundary extends Component<
    { fallback: ReactNode; children: ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    render() {
        if (this.state.hasError) return this.props.fallback
        return this.props.children
    }
}

export function Figure3D() {
    return (
        <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 0.3, 4.6], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
        >
            <ambientLight intensity={0.35} />
            {/* single strong rim/key light */}
            <spotLight
                position={[4, 6, 3]}
                angle={0.5}
                penumbra={1}
                intensity={40}
                color="#fff4e8"
                castShadow
            />
            <pointLight position={[-4, -1, -3]} intensity={8} color="#AA141E" />

            <Suspense
                fallback={
                    <Html
                        center
                        position={[0, 0, 0]}
                        style={{
                            width: "100px",
                            height: "100px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >

                        <Spinner className="size-8 text-primary" />
                    </Html>
                }
            >
                <Float
                    speed={1.4}
                    rotationIntensity={0.3}
                    floatIntensity={0.15}
                >
                    <ModelErrorBoundary fallback={<ShadowCreature />}>
                        <GLBModel />
                    </ModelErrorBoundary>
                </Float>

                <ContactShadows
                    position={[0, -1.6, 0]}
                    opacity={0.55}
                    scale={9}
                    blur={2.6}
                    far={4}
                />

                <Environment preset="warehouse" />
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
