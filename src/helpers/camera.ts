import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {type Camera} from "three";
import * as THREE from "three";

export function addFreeCamControls(camera: Camera, renderer: THREE.WebGLRenderer) {
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;     // Smooth movement
    controls.dampingFactor = 0.05;

    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;

    controls.maxPolarAngle = Math.PI / 2; // Prevent camera from going under the floor

    return controls;
}
