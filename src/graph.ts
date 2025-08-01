import * as THREE from 'three';
import { Scene, Group } from 'three';

const MAX_WIDTH = 20;
const CUBE_WIDTH = 0.1;
const CUBE_SPACING = 0.1;

let cubeGroup: Group | null = null;

export async function loadGraphModel(scene: Scene) {
    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
}

export function updateGraphData(values: number[]) {
    if (!cubeGroup) return;

    cubeGroup.clear();

    const start = Math.max(0, values.length - MAX_WIDTH);
    const visibleValues = values.slice(start);

    const totalWidth = visibleValues.length * (CUBE_WIDTH + CUBE_SPACING);
    const halfWidth = totalWidth / 2;

    visibleValues.forEach((val, index) => {
        const geometry = new THREE.BoxGeometry(CUBE_WIDTH, val, CUBE_WIDTH);
        const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(`hsl(${val * 20}, 100%, 50%)`) });
        const cube = new THREE.Mesh(geometry, material);

        cube.position.set(
            index * (CUBE_WIDTH + CUBE_SPACING) - halfWidth + CUBE_WIDTH / 2,
            0,
            val/2
        );

        cubeGroup!.add(cube);
    });
}