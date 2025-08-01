import * as THREE from 'three';

export function initScene(canvasId = 'webgl') {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) throw new Error(`Canvas element with id '${canvasId}' not found`);

    const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    return {canvas, renderer, scene};
}
