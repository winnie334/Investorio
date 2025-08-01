// scenes/Game.scene.ts
import * as THREE from 'three';
import {fitToPortrait} from '../../helpers/layout.ts';
import {buyButtonModelUrl, dinoModelUrl, loadModel, loadModelInteractive} from '../../models.ts';
import {getRenderer} from "../initRenderer.ts";

export function createGameScreen() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.5, 5);

    const renderer = getRenderer();
    const canvas = renderer.domElement;

    fitToPortrait(renderer, camera, canvas);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    loadModel(dinoModelUrl, scene);

    let buyButtonModel: THREE.Group | undefined;
    loadModelInteractive(buyButtonModelUrl, scene, camera, canvas, () => {
        console.log('Clicked');
    }).then((data) => {
        if (!data) return;
        const [model, clearOnClick] = data;
        buyButtonModel = model
        setTimeout(() => {
            clearOnClick()
        }, 5000)
    });

    function update(delta: number) {
        if (buyButtonModel) {
            buyButtonModel.rotation.y += delta;
        }
    }

    return {scene, camera, update};
}
