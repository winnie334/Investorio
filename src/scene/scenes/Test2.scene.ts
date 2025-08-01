import * as THREE from 'three';
import {getRenderer} from '../initRenderer.ts';
import {fitToPortrait} from '../../helpers/layout.ts';

export function createTest2Screen() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    // Optional: subtle fog for diorama depth
    scene.fog = new THREE.Fog(0x222222, 40, 80);

    const camera = new THREE.PerspectiveCamera(
        80,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 35, 5); // Higher and further to look deeper

    const renderer = getRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    fitToPortrait(renderer, camera, canvas);

    // Ambient light
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    // Directional light from above (soft sunlight feel)
    const dirLight = new THREE.DirectionalLight(0xfff8e7, 1);
    dirLight.position.set(20, 50, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    scene.add(dirLight);

    // Spotlight for "celestial shaft" effect
    const spotLight = new THREE.SpotLight(0xfffacd, 1.5, 100, Math.PI / 6, 0.3, 1);
    spotLight.position.set(0, 80, 0);
    spotLight.castShadow = true;
    spotLight.target.position.set(0, 0, -30);
    scene.add(spotLight);
    scene.add(spotLight.target);

    // Platform (floating room base)
    const platform = new THREE.Mesh(
        new THREE.BoxGeometry(22, 1, 50),
        new THREE.MeshStandardMaterial({color: 0x2c2c2c})
    );
    platform.position.y = -0.5;
    platform.receiveShadow = true;
    scene.add(platform);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({color: 0x444444});
    const wallHeight = 10;
    const wallThickness = 0.5;
    const roomDepth = 50;

    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(20, wallHeight, wallThickness),
        wallMaterial
    );
    backWall.position.set(0, wallHeight / 2, -roomDepth / 2);
    backWall.castShadow = true;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, roomDepth),
        wallMaterial
    );
    leftWall.position.set(-10.5, wallHeight / 2, -roomDepth / 2 + roomDepth / 2);
    leftWall.castShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, roomDepth),
        wallMaterial
    );
    rightWall.position.set(10.5, wallHeight / 2, -roomDepth / 2 + roomDepth / 2);
    rightWall.castShadow = true;
    scene.add(rightWall);


    return {scene, camera, renderer};
}
