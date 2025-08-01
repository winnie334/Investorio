// scene/TitleScreen.scene.ts
import * as THREE from 'three';
import {loadScene} from '../sceneManager.ts';
import {fitToPortrait} from '../../helpers/layout.ts';
import {getRenderer} from '../initRenderer.ts';

export function createTitleScreen() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = getRenderer();
    const canvas = renderer.domElement;
    fitToPortrait(renderer, camera, canvas);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshBasicMaterial({color: 0x223344})
    );
    plane.position.z = -5;
    scene.add(plane);

    document.getElementById('title-screen')!.style.display = 'flex';
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.onclick = () => {
            document.getElementById('title-screen')!.style.display = 'none';
            loadScene('game');
        };
    }


    return {scene, camera};
}
