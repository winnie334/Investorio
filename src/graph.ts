import * as THREE from 'three';
import { Scene, Group } from 'three';

let MAX_VALUES = 50;
let CUBE_WIDTH = 0.045;
let CUBE_SPACING = 0;
let X_OFFSET = 0;
let Z_OFFSET = 0;

let cubeGroup: Group | null = null;

export async function loadGraphModel(scene: Scene, x: number, z: number) {
    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    X_OFFSET = x;
    Z_OFFSET = z;

    // Background
    const geo = new THREE.BoxGeometry(4, 0.1, 2.5)
    const mat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa});
    const cube = new THREE.Mesh(geo, mat);
    cube.position.set(x+1, 0, z-2)
    scene.add(cube);
}

export function updateGraphData(values: number[]) {
    if (!cubeGroup) return;

    cubeGroup.clear();

    const start = Math.max(0, values.length - MAX_VALUES);
    const visibleValues = values.slice(start);

    const min = Math.min(...visibleValues);
    const max = Math.max(...visibleValues);
    const range = max - min || 1;

    const graphMin = -0.55;
    const graphMax = -1.8;
    const graphHeight = graphMin - graphMax;

    visibleValues.forEach((val, index) => {
        const geometry = new THREE.BoxGeometry(CUBE_WIDTH, CUBE_WIDTH / 2, CUBE_WIDTH * 3);
        const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(`hsl(${val * 20}, 100%, 50%)`) });
        const cube = new THREE.Mesh(geometry, material);

        const scaledZ = graphMin - ((val - min) / range) * graphHeight;

        cube.position.set(
            X_OFFSET + index * (CUBE_WIDTH + CUBE_SPACING) - 0.1,
            //index * (CUBE_WIDTH + CUBE_SPACING) - halfWidth + CUBE_WIDTH / 2 + X_OFFSET,
            2,
            scaledZ + Z_OFFSET
        );

        cubeGroup.add(cube);
    });
}
