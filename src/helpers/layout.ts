import * as THREE from 'three';


export function updateRendererSize(renderer: THREE.WebGLRenderer,
                                   camera: THREE.PerspectiveCamera,
                                   canvas: HTMLCanvasElement,
                                   aspectRatio = 9 / 16) {
    const desiredAspect = aspectRatio;
    const windowAspect = window.innerWidth / window.innerHeight;

    let renderWidth = window.innerWidth;
    let renderHeight = window.innerHeight;

    if (windowAspect > desiredAspect) {
        // Window is too wide
        renderHeight = window.innerHeight;
        renderWidth = renderHeight * desiredAspect;
    } else {
        // Window is too tall
        renderWidth = window.innerWidth;
        renderHeight = renderWidth / desiredAspect;
    }

    renderer.setSize(renderWidth, renderHeight);

    // Center the canvas
    canvas.style.position = 'absolute';
    canvas.style.left = `${(window.innerWidth - renderWidth) / 2}px`;
    canvas.style.top = `${(window.innerHeight - renderHeight) / 2}px`;

    camera.aspect = renderWidth / renderHeight;
    camera.updateProjectionMatrix();
}