import * as THREE from 'three';
import { Scene, Group } from 'three';

let MAX_WIDTH = 20;
let CUBE_WIDTH = 0.1;
let CUBE_SPACING = 0;
let X_OFFSET = 0;
let Z_OFFSET = 0;

let cubeGroup: Group | null = null;

export async function loadGraphModel(scene: Scene, x: number, z: number) {
    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    X_OFFSET = x;
    Z_OFFSET = z;
}

export function updateGraphData(values: number[]) {
    if (!cubeGroup) return;

    cubeGroup.clear();

    const start = Math.max(0, values.length - MAX_WIDTH);
    const visibleValues = values.slice(start);

    const totalWidth = visibleValues.length * (CUBE_WIDTH + CUBE_SPACING);
    const halfWidth = totalWidth / 2;

    const min = Math.min(...visibleValues);
    const max = Math.max(...visibleValues);
    const range = max - min || 1;

    const graphMin = -1;
    const graphMax = -2;
    const graphHeight = graphMin - graphMax;

    visibleValues.forEach((val, index) => {
        const geometry = new THREE.BoxGeometry(CUBE_WIDTH, CUBE_WIDTH, CUBE_WIDTH);
        const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(`hsl(${val * 20}, 100%, 50%)`) });
        const cube = new THREE.Mesh(geometry, material);

        const scaledZ = graphMin - ((val - min) / range) * graphHeight;

        cube.position.set(
            index * (CUBE_WIDTH + CUBE_SPACING) - halfWidth + CUBE_WIDTH / 2 + X_OFFSET,
            2,
            scaledZ + Z_OFFSET
        );

        cubeGroup.add(cube);
    });
}
