import * as THREE from 'three';
import {getRenderer} from "../initRenderer.ts";
import {fitToPortrait} from "../../helpers/layout.ts";

export function createTestScreen() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    const camera = new THREE.PerspectiveCamera(
        60, // wider FOV looks better in 2.5D
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 30, 30); // Looking diagonally down into the room
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const renderer = getRenderer(); // Your existing function
    const canvas = renderer.domElement;
    fitToPortrait(renderer, camera, canvas); // Your existing logic

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7.5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({color: 0x333333});
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({color: 0x444444});
    const wallHeight = 7;
    const wallThickness = 1;

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(30, wallHeight, wallThickness), wallMaterial);
    backWall.position.set(0, wallHeight / 2, -50);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 50), wallMaterial);
    leftWall.position.set(-15, wallHeight / 2, -25);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 50), wallMaterial);
    rightWall.position.set(15, wallHeight / 2, -25);
    scene.add(rightWall);

    // Test character/object (cube)
    const character = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 1),
        new THREE.MeshStandardMaterial({color: 0x00ffcc})
    );
    character.position.set(0, 1, 0);
    scene.add(character);

    const graph = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 4),
        new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide})
    );
    graph.position.set(0, 5, -45); // Just in front of the back wall
    graph.rotation.y = Math.PI;
    scene.add(graph);

    return {scene, camera};
}
