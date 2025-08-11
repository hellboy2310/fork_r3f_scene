import { Edges, PivotControls, useGLTF } from '@react-three/drei'
import { Mesh } from 'three';
import { useSnapshot } from 'valtio'
import { state } from './stores/store'
import { useCanvas } from '@/contexts/CanvasContext';

interface ModelProps {
    name: string;
    [key: string]: any;
}

const Model = ({ name, ...props }: ModelProps) => {
    const snap = useSnapshot(state);
    const { nodes } = useGLTF('/compressed.glb');

    const { isTransform, showWireframe } = useCanvas()

    return (
        <PivotControls
            anchor={[0, 0, 0]}
            depthTest={false}
            disableAxes={!isTransform || snap.current !== name}
            disableSliders={!isTransform || snap.current !== name}
            disableRotations={!isTransform || snap.current !== name}
            disableScaling
            scale={0.5}
        >
            <mesh
                onClick={(e) => (e.stopPropagation(), (state.current = name))}
                onPointerMissed={(e) => e.type === 'click' && (state.current = null)}
                name={name}
                geometry={(nodes[name] as Mesh).geometry}
                material={(nodes[name] as Mesh).material}
                material-color={snap.current === name ? '#4A90E2' : 'orange'}
                material-wireframe={showWireframe}
                material-transparent={true}
                material-opacity={snap.current === name ? 0.5 : 1}
                {...props}
                dispose={null}
            >
                <Edges linewidth={4} color="white" visible={snap.current === name} />
            </mesh>
        </PivotControls>
    );
}

export default Model
