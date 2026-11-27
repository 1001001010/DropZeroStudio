
'use client'

import { Component, Suspense, useMemo, useRef, useEffect, type ReactNode } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import {
    Environment,
    Html,
    OrbitControls,
    useGLTF,
} from '@react-three/drei'
import { Box3, Vector3, type Group } from 'three'

import { Spinner } from '@/components/ui/spinner'

const TARGET_HEIGHT = 2

const CAMERA_POSITION: [number, number, number] = [0, 0.15, 3.5]

interface Figure3DProps {
    modelPath: string | null
}

/**
 * Загружает GLB-модель, нормализует её размер
 * и центрирует относительно её реальных границ.
 */
function GLBModel({ modelPath }: { modelPath: string }) {
    const group = useRef<Group>(null)
    const { scene } = useGLTF(modelPath)

    const { object, scale, position } = useMemo(() => {
        const object = scene.clone(true)

        // Обновляем матрицы перед вычислением границ.
        object.updateMatrixWorld(true)

        const box = new Box3().setFromObject(object)
        const dimensions = box.getSize(new Vector3())
        const center = box.getCenter(new Vector3())

        const modelHeight = dimensions.y || 1
        const scale = TARGET_HEIGHT / modelHeight

        return {
            object,
            scale,
            position: [
                -center.x * scale,
                -center.y * scale,
                -center.z * scale,
            ] as [number, number, number],
        }
    }, [scene])

    return (
        <group ref={group}>
            <group scale={scale} position={position}>
                <primitive object={object} />
            </group>
        </group>
    )
}

/**
 * Процедурная заглушка, если модель отсутствует
 * или не смогла загрузиться.
 */
function ShadowCreature() {
    return (
        <group position={[0, -0.15, 0]}>
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

/**
 * Перехватывает ошибки загрузки и отображения GLB.
 */
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

/**
 * Индикатор загрузки внутри Canvas.
 */
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

/**
 * Фиксированная камера для одинакового визуального масштаба
 * всех фигурок независимо от количества моделей.
 */
function FixedCamera() {
    const { camera } = useThree()

    useEffect(() => {
        camera.position.set(...CAMERA_POSITION)
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()
    }, [camera])

    return null
}

/**
 * Основной компонент 3D-фигурки.
 */
export function Figure3D({ modelPath }: Figure3DProps) {
    const normalizedPath = modelPath
        ? `/storage/${modelPath.replace(/^\/+/, '')}`
        : null

    return (
        <Canvas
            dpr={[1, 1.5]}
            performance={{ min: 0.5 }}
            camera={{
                position: CAMERA_POSITION,
                fov: 42,
            }}
            gl={{
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance',
            }}
        >
            <FixedCamera />

            {/* Управление вращением фигурки */}
            <OrbitControls
                enablePan={false}
                enableZoom={false}
                enableRotate
                rotateSpeed={0.7}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 1.7}
            />

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

                <Environment
                    files="/hdr/empty_warehouse_01_1k.hdr"
                    background={false}
                    environmentIntensity={0.8}
                />
            </Suspense>
        </Canvas>
    )
}
