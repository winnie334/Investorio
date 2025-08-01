import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import modelUrl from './assets/models/BuyButton.glb';
import dinoUrl from './assets/models/dino.fbx';

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

const gltfLoader = new GLTFLoader();
gltfLoader.load(
    modelUrl,
    (gltf) => {
        const model = gltf.scene;
        model.scale.set(1, 1, 1);
        model.position.set(-1.5, 0, 0);
        scene.add(model);
    },
    undefined,
    (error) => {
        console.error('Error loading GLB model:', error);
    }
);

const fbxLoader = new FBXLoader();
fbxLoader.load(
    dinoUrl,
    (dino) => {
        dino.scale.set(1, 1, 1); // FBX models are often huge
        dino.position.set(1.5, 0, 0);
        scene.add(dino);
    },
    undefined,
    (error) => {
        console.error('Error loading FBX model:', error);
    }
);

// Animate
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
