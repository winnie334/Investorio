// scenes/Game.scene.ts
import * as THREE from 'three';
import {fitToPortrait} from '../../helpers/layout.ts';
import {buyButtonModelUrl, dinoModelUrl, loadModel, loadModelInteractive} from '../../models.ts';
import {getRenderer} from "../initRenderer.ts";
import {loadGraphModel, updateGraphData} from "../../graph.ts";


const newValueFrequency = 1 // 1 val per sec

export function createGameScreen() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const renderer = getRenderer();
    const canvas = renderer.domElement;

    fitToPortrait(renderer, camera, canvas);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    // loadModel(dinoModelUrl, scene);

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

    loadGraphModel(scene, 0, 0);

    let values: number[] = [2];
    let progressToNextValue = 0

    function update(delta: number) {
        if (buyButtonModel) buyButtonModel.scale.set(0, 0, 0)

        progressToNextValue += delta;
        while (progressToNextValue > newValueFrequency) {
            progressToNextValue -= newValueFrequency;
            const newVal = values[values.length-1] + (4 * Math.random() - 1)
            values.push(newVal);
            updateGraphData(values);
        }

    }

    return {scene, camera, update};
}
