import * as THREE from 'three';
import {loadScene} from '../sceneManager.ts';
import {fitToPortrait} from '../../helpers/layout.ts';
import {getRenderer} from '../initRenderer.ts';
import {Vector3, Euler} from 'three';
import {addText} from "../../models.ts";

export function createTitleScreen() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    const renderer = getRenderer();
    const canvas = renderer.domElement;
    fitToPortrait(renderer, camera, canvas);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    // Background plane
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 30), // taller for portrait
        new THREE.MeshBasicMaterial({color: 0x223344})
    );
    plane.position.z = -5;
    scene.add(plane);

    addText("Investorio", {
        position: new Vector3(-3, 7, 0),
        scale: new Vector3(1, 1, 1),
        color: 0xffaa00,
        scene,
    });

    addText("Learn about investing", {
        position: new Vector3(-3, 5.2, 0),
        scale: new Vector3(0.5, 0.5, 0.5),
        color: 0xffffff,
        scene,
    });

    addText("in a fun way (maybe)", {
        position: new Vector3(-3, 4.2, 0),
        scale: new Vector3(0.5, 0.5, 0.5),
        color: 0xffffff,
        scene,
    });

    addText("Click to Start", {
        position: new Vector3(-2, 0, 0),
        scale: new Vector3(0.5, 0.5, 0.5),
        color: 0xffffff,
        scene,
    });

    addText("© 2025 Wava Productions", {
        position: new Vector3(-2.4, -7, 0),
        scale: new Vector3(0.3, 0.3, 0.3),
        color: 0x888888,
        scene,
    });

    function update(_deltaT: number) {
        // No animation for now
    }

    canvas.addEventListener('click', () => {
        loadScene('game');
    });

    return {scene, camera, update};
}
