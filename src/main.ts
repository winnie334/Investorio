import * as THREE from 'three';
import {buyButtonModelUrl, dinoModelUrl, loadModel, loadModelInteractive} from "./models.ts";
import {updateRendererSize} from "./helpers/layout.ts";
import {initScene} from "./helpers/initScene.ts";

const {canvas, renderer, scene} = initScene();
import { loadGraphModel, updateGraphData } from "./graph.ts"

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 0);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

async function loadModels() {
    const dino = await loadModel(dinoModelUrl, scene);
    const buyButton = await loadModelInteractive(buyButtonModelUrl, scene, camera, canvas, () => {
        console.log('Clicked');
    });
    const graph = await loadGraphModel(scene);
}


loadModels();
updateRendererSize(renderer, camera, canvas);

let values: number[] = [2, 3, 3, 3, 8, 12, 10, 11, 10, 12];

// Update every second with new random value
setInterval(() => {
    const newVal = Math.floor(Math.random() * 15);
    values.push(newVal);
    updateGraphData(values);
}, 1000);

// Animate
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
