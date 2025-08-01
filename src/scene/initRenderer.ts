import * as THREE from 'three';

let renderer: THREE.WebGLRenderer;
let canvas: HTMLCanvasElement;

export function initRenderer(): { renderer: THREE.WebGLRenderer; canvas: HTMLCanvasElement } {
    canvas = document.getElementById('webgl') as HTMLCanvasElement;
    if (!canvas) throw new Error('Canvas element not found');

    renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    return {renderer, canvas};
}

export function getRenderer() {
    return renderer;
}
