import * as THREE from 'three';
import { Scene, Group } from 'three';
import {addText} from "./models.ts";

let MAX_VALUES = 47;
let CUBE_WIDTH = 0.07;
let CUBE_SPACING = 0;
let X_OFFSET = 0;
let Z_OFFSET = 0;
let BG_WIDTH = 4
const annotationCache: Record<number, THREE.Object3D | undefined> = {};

let cubeGroup: Group | null = null;

export async function loadGraphModel(scene: Scene, x: number, z: number) {
    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    X_OFFSET = x;
    Z_OFFSET = z;

    // Background
    const geo = new THREE.BoxGeometry(BG_WIDTH, 0.1, 2.5)
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
    let range = max - min;
    if (range < 3.5) range = 3.5

    const graphMin = -0.9;
    const graphMax = -3;
    const graphHeight = graphMin - graphMax;

    visibleValues.forEach((val, index) => {
        const geometry = new THREE.BoxGeometry(CUBE_WIDTH, CUBE_WIDTH / 2, CUBE_WIDTH * 3);
        const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(`hsl(${val * 20}, 100%, 50%)`) });
        const cube = new THREE.Mesh(geometry, material);

        const scaledZ = graphMin - ((val - min) / range) * graphHeight;

        cube.position.set(X_OFFSET + index * (CUBE_WIDTH + CUBE_SPACING) - 0.5, 0.1, scaledZ + Z_OFFSET );

        cubeGroup!.add(cube);
    });

    for (let i = Math.ceil(min); i <= Math.floor(max); i++) {
        const scaledZ = graphMin - ((i - min) / range) * graphHeight;

        const geometry = new THREE.BoxGeometry(BG_WIDTH * 0.85, CUBE_WIDTH / 2, CUBE_WIDTH / 5);
        const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xbbbbbb) });
        const line = new THREE.Mesh(geometry, material);

        line.position.set(X_OFFSET + 1.1, 0.05, scaledZ + Z_OFFSET);
        cubeGroup.add(line);

        getAnnotation(i).then(annotation => {
            if (!annotation) return;
            annotation.position.set(X_OFFSET - 0.9, 0.05, scaledZ + Z_OFFSET);
            annotation.scale.set(0.1, 0.1, 0.1);
            annotation.rotation.set(-Math.PI/2, 0, 0);
            cubeGroup!.add(annotation);
        })
    }
}

function getAnnotation(i: number): Promise<THREE.Object3D | undefined > {
    if (annotationCache[i]) return Promise.resolve(annotationCache[i]);

    return addText("$" + i, 0xbbbbbb).then(textMesh => {
        annotationCache[i] = textMesh;
        return textMesh;
    });
}
