import * as THREE from 'three';
import {getGameLogic} from "./gameLogic.ts";
import {
    addText,
    defaultPosition,
    defaultRotation,
    defaultScale,
    type ModelLoadParams
} from "./models.ts";

const MAXVALUE = 10000;

let playerBar: THREE.Mesh;
let monkeyBar: THREE.Mesh;
let stoneBar: THREE.Mesh;
let comparatorGroup: THREE.Group;

type MonkeyComparatorParams = ModelLoadParams & {
    width: number;
};

let w = 0

export function loadMonkeyComparator(params: MonkeyComparatorParams) {
    const {
        scene,
        scale = defaultScale,
        position = defaultPosition,
        rotation = defaultRotation,
        width = 200,
    } = params;

    const height = 2;
    const depth = 1;
    w = width

    comparatorGroup = new THREE.Group();
    comparatorGroup.position.copy(position);
    comparatorGroup.rotation.set(rotation.x, rotation.y, rotation.z);
    comparatorGroup.scale.copy(scale);


    const makeBar = (color: number, y: number) => {
        const geometry = new THREE.BoxGeometry(depth, height, 1);
        const material = new THREE.MeshLambertMaterial({color});
        const bar = new THREE.Mesh(geometry, material);
        bar.position.set(0, y, 0);
        bar.scale.set(1, 1, 0.1);
        comparatorGroup.add(bar);
        return bar;
    };

    playerBar = makeBar(0x4CAF50, 5.7);
    monkeyBar = makeBar(0xFF9800, 2.85);
    stoneBar = makeBar(0x2196F3, -0.1);


    showMonkeyComparator(false)
    updateMonkeyComparator()


    scene?.add(comparatorGroup);

}

export function showMonkeyComparator(isVisible: boolean) {
    if (comparatorGroup) {
        comparatorGroup.visible = isVisible;
    }
}

export function updateMonkeyComparator() {
    const gameLogic = getGameLogic();

    const score = gameLogic.getNetWorth();
    const monkeyScore = gameLogic.getMonkeyScore();
    const stoneScore = gameLogic.getStoneScore();


    const scaleValue = (value: number) =>
        Math.max(0.01, (value / MAXVALUE) * w);

    const updateBar = (bar: THREE.Mesh, value: number) => {
        bar.scale.z = scaleValue(value);
        bar.position.z = bar.scale.z / 2;
    };

    updateBar(playerBar, score);
    updateBar(monkeyBar, monkeyScore);
    updateBar(stoneBar, stoneScore);
}

