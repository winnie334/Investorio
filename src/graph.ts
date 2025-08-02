import * as THREE from 'three';
import {Scene, Group} from 'three';
import {addText} from "./models.ts";
import type {Stock} from "./gameLogic.ts";

let MAX_VALUES = 47;
let CUBE_WIDTH = 0.07;
let CUBE_SPACING = 0;
let BG_WIDTH = 4
const annotationCache: Record<number, THREE.Object3D | undefined> = {};

let cubeGroup: Group | null = null;
const files = ['baba', 'bats', 'gme', 'irtc', 'sp500'];
export let allPrices: number[][] = [];

(async () => {
    allPrices = await Promise.all(
        files.map(f =>
            fetch(`/${f}.csv`)
                .then(r => r.text())
                .then(t => t.trim().split('\n').slice(1).map(l => parseFloat(l.split(',')[4].replace(/"/g, ''))))
        )
    );
    console.log('Loaded:', allPrices);
})();

export async function loadGraphModel(scene: Scene, x: number, y: number, z: number, rotation: THREE.Euler = new THREE.Euler(), scale = 1) {

    cubeGroup = new THREE.Group();
    cubeGroup.position.set(x, y, z);
    cubeGroup.rotation.copy(rotation); // apply full rotation
    cubeGroup.scale.copy(new THREE.Vector3(scale, scale, scale));
    scene.add(cubeGroup);

    // Background
    const geo = new THREE.BoxGeometry(BG_WIDTH, 0.1, 2.5);
    const mat = new THREE.MeshStandardMaterial({color: 0xaaaaaa});
    const background = new THREE.Mesh(geo, mat);
    background.position.set(1, 0, -2);
    cubeGroup.add(background);
}

export function updateGraphData(stock: Stock, day: number) {
    if (!cubeGroup) return;

    cubeGroup.clear();

    const geo = new THREE.BoxGeometry(BG_WIDTH, 0.1, 2.5);
    const mat = new THREE.MeshStandardMaterial({color: 0xaaaaaa});
    const background = new THREE.Mesh(geo, mat);
    background.position.set(1, 0, -2);
    cubeGroup.add(background);

    // const start = Math.max(0, values.length - MAX_VALUES);
    const visibleValues = allPrices[1].slice(day, day+MAX_VALUES)

    const min = Math.min(...visibleValues);
    const max = Math.max(...visibleValues);
    let range = max - min;
    if (range < 3.5) range = 3.5;

    const graphMin = -0.9;
    const graphMax = -3;
    const graphHeight = graphMin - graphMax;

    visibleValues.forEach((val, index) => {
        const geometry = new THREE.BoxGeometry(CUBE_WIDTH, CUBE_WIDTH / 2, CUBE_WIDTH * 3);
        const material = new THREE.MeshStandardMaterial({color: new THREE.Color(`hsl(${val * 20}, 100%, 50%)`)});
        const cube = new THREE.Mesh(geometry, material);

        const scaledZ = graphMin - ((val - min) / range) * graphHeight;

        cube.position.set(index * (CUBE_WIDTH + CUBE_SPACING) - 0.5, 0.1, scaledZ);
        cubeGroup?.add(cube);
    });

    for (let i = Math.ceil(min); i <= Math.floor(max); i++) {
        const scaledZ = graphMin - ((i - min) / range) * graphHeight;

        const geometry = new THREE.BoxGeometry(BG_WIDTH * 0.85, CUBE_WIDTH / 2, CUBE_WIDTH / 5);
        const material = new THREE.MeshStandardMaterial({color: new THREE.Color(0xbbbbbb)});
        const line = new THREE.Mesh(geometry, material);

        line.position.set(1.1, 0.05, scaledZ);
        cubeGroup.add(line);

        const annotation = getAnnotation(i);
        if (!annotation) return;
        annotation.position.set(-0.9, 0.05, scaledZ);
        annotation.scale.set(0.1, 0.1, 0.1);
        annotation.rotation.set(-Math.PI / 2, 0, 0);
        cubeGroup.add(annotation);
    }
}

function getAnnotation(i: number): THREE.Object3D | undefined {
    if (annotationCache[i]) return annotationCache[i]

    const textMesh = addText("$" + i, 0xbbbbbb);
    annotationCache[i] = textMesh;
    return textMesh;
}
