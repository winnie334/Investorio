import * as THREE from 'three';
import {Scene, Group} from 'three';
import {addText} from "./models.ts";
import {allPrices, getGameLogic, type Stock} from "./gameLogic.ts";

let MAX_VALUES = 47;
let CUBE_WIDTH = 0.07;
let CUBE_SPACING = 0;
let BG_WIDTH = 4
const annotationCache: Record<number, THREE.Object3D | undefined> = {};

let cubeGroup: Group | null = null;

function createBg() {
    // Background
    const geo = new THREE.BoxGeometry(BG_WIDTH, 0.1, 2.5);
    const mat = new THREE.MeshStandardMaterial({color: 0xaaaaaa});
    const background = new THREE.Mesh(geo, mat);
    background.position.set(1, 0, -2);
    return background;
}

function createBgOutline() {
    // Background outline
    const geo2 = new THREE.BoxGeometry(BG_WIDTH * 1.02, 0.1 - 0.01, 2.5 * 1.02);
    const mat2 = new THREE.MeshStandardMaterial({color: 0x000000});
    const background2 = new THREE.Mesh(geo2, mat2);
    background2.position.set(1, 0, -2);
    return background2
}

export async function loadGraphModel(scene: Scene, x: number, y: number, z: number, rotation: THREE.Euler = new THREE.Euler(), scale = 1) {
    cubeGroup = new THREE.Group();
    cubeGroup.position.set(x, y, z);
    cubeGroup.rotation.copy(rotation); // apply full rotation
    cubeGroup.scale.copy(new THREE.Vector3(scale, scale, scale));
    scene.add(cubeGroup);
    cubeGroup.add(createBg());
    cubeGroup.add(createBgOutline());
    setShowGraph(false)
}

export function setShowGraph(isVisible: boolean) {
    if (cubeGroup) {
        cubeGroup.visible = isVisible;
    }
}

export function updateGraphData(stock: Stock, day: number) {
    if (!cubeGroup) return;

    cubeGroup.clear();

    cubeGroup.add(createBg());
    cubeGroup.add(createBgOutline());

    if (getGameLogic().getFinishTime() != -1) MAX_VALUES -= 3
    const visibleValues = allPrices[stock].slice(Math.max(0, day - MAX_VALUES + 1), day + 1) // +1 so day is included
    if (MAX_VALUES == 0) return

    const min = Math.min(...visibleValues);
    const max = Math.max(...visibleValues);
    let range = max - min;
    if (range < 3.5) range = 3.5;

    const graphMin = -0.9;
    const graphMax = -3;
    const graphHeight = graphMin - graphMax;

    visibleValues.forEach((val, index) => {
        const geometry = new THREE.BoxGeometry(CUBE_WIDTH, CUBE_WIDTH / 2, CUBE_WIDTH * 3);
        const material = new THREE.MeshStandardMaterial({color: new THREE.Color(`hsl(${val * 10}, 100%, 50%)`)});
        const cube = new THREE.Mesh(geometry, material);

        const scaledZ = graphMin - ((val - min) / range) * graphHeight;

        cube.position.set(index * (CUBE_WIDTH + CUBE_SPACING) - 0.5, 0.1, scaledZ);
        cubeGroup?.add(cube);
    });

    let start = Math.ceil(min)
    let stepHeight = 1
    if (range > 15) {
        stepHeight = 5
        start = Math.ceil(min) + stepHeight - (Math.ceil(min) % stepHeight)
    }
    for (let i = start; i <= Math.floor(max); i += stepHeight) {
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

    const textMesh = addText("$" + i);
    annotationCache[i] = textMesh;
    return textMesh;
}
