import * as THREE from 'three';
import {buyButtonModelUrl, dinoModelUrl, loadModel, loadModelInteractive} from "./models.ts";
import {updateRendererSize} from "./helpers/layout.ts";
import {initScene} from "./helpers/initScene.ts";

const {canvas, renderer, scene} = initScene();
import { loadGraphModel } from "./graph.ts"

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1.5, 5);

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


// Animate
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
