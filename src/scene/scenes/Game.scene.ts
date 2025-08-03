import * as THREE from 'three';
import {getRenderer} from '../initRenderer.ts';
import {fitToPortrait} from '../../helpers/layout.ts';
import {getGameLogic} from "../../gameLogic.ts";
import {getGameWorld} from "../../gameWorld.ts";
import {playSound} from "../../soundManager.ts";


export function createGameScreen() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

    // I do not understand why a timeout is necessary lol -> very cool --> sisi :(
    setTimeout(() => {
        camera.position.set(0, 20, 40);
        camera.lookAt(new THREE.Vector3(0, 5, 0));
    }, 10);

    const renderer = getRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    fitToPortrait(renderer, camera, canvas);

    const logic = getGameLogic()
    const gameWorld = getGameWorld()
    playSound("BACKGROUND", 0.1)
    gameWorld.init(scene, camera, canvas)
    gameWorld.createRoom()

    function update(deltaT: number) {
        logic.update(deltaT)
        const models = gameWorld.getRoomObjects()?.selectStockModels as THREE.Mesh[]
        if (models) {
            models.forEach(model => {
                model.rotation.y += deltaT / 2
            })
        }

        const cash = gameWorld.getCashObjects();
        cash.forEach((cashObject, id) => {
            cashObject.rotation.y += deltaT / 4
        });


    }

    return {scene, camera, renderer, update};
}
