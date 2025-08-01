import * as THREE from 'three';
import {buyButtonModelUrl, dinoModelUrl, loadModel, loadModelInteractive} from "./models.ts";
import {updateRendererSize} from "./helpers/layout.ts";


const canvas = document.getElementById('webgl') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);

// Scene and camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222); // Optional background color
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
}


loadModels();
updateRendererSize(renderer, camera, canvas);


// Animate
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
