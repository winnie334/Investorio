import * as THREE from 'three';
import {getRenderer} from '../initRenderer.ts';
import {fitToPortrait} from '../../helpers/layout.ts';
import {createGameLogic} from "../../gameLogic.ts";
import {loadGraphModel, updateGraphData} from "../../graph.ts";

function createRoom(scene: THREE.Scene) {
    // Ambient light
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    // Directional light
    const dirLight = new THREE.DirectionalLight(0xfff8e7, 1);
    dirLight.position.set(20, 50, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    scene.add(dirLight);

    // Spotlight from above
    const spotLight = new THREE.SpotLight(0xfffacd, 1.5, 100, Math.PI / 6, 0.3, 1);
    spotLight.position.set(0, 80, 0);
    spotLight.castShadow = true;
    spotLight.target.position.set(0, 0, -30);
    scene.add(spotLight);
    scene.add(spotLight.target);


    // Room dimensions
    const wallMaterial = new THREE.MeshStandardMaterial({color: 0x444444});
    const wallHeight = 20;
    const wallThickness = 0.5;
    const roomDepth = 30;
    const roomWidth = 21;

    // Platform
    const platform = new THREE.Mesh(
        new THREE.BoxGeometry(roomWidth, 1, roomDepth),
        new THREE.MeshStandardMaterial({color: 0x2c2c2c})
    );
    platform.position.y = -0.5;
    platform.receiveShadow = true;
    scene.add(platform);

    // Back wall
    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(roomWidth, wallHeight, wallThickness),
        wallMaterial
    );
    backWall.position.set(0, wallHeight / 2, -roomDepth / 2);
    backWall.castShadow = true;
    scene.add(backWall);


    // Left wall
    const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, roomDepth),
        wallMaterial
    );
    leftWall.position.set(-roomWidth / 2, wallHeight / 2, 0);
    leftWall.castShadow = true;
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, roomDepth),
        wallMaterial
    );
    rightWall.position.set(roomWidth / 2, wallHeight / 2, 0);
    rightWall.castShadow = true;
    scene.add(rightWall);

    loadGraphModel(scene, -4, 6, -14, new THREE.Euler(Math.PI / 2, 0, 0), 4)

}

export function createGameScreen() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    scene.fog = new THREE.Fog(0x222222, 40, 80);

    const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    setTimeout(() => {
        camera.position.set(0, 20, 40);
        camera.lookAt(new THREE.Vector3(0, 5, 0));
    }, 10);

    const renderer = getRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    fitToPortrait(renderer, camera, canvas);
    createRoom(scene)

    const logic = createGameLogic()
    logic.start()

    function update(deltaT: number) {
        logic.update(deltaT)
    }


    return {scene, camera, renderer, update};
}
