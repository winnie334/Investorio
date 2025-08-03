import {getRenderer, initRenderer} from "./src/scene/initRenderer.ts";
import {getScene, loadScene} from "./src/scene/sceneManager.ts";
import {loadDefaultFont} from "./src/models.ts";

let lastTime = performance.now();
const path = window.location.pathname; // e.g., "/game/menu"

export const isDev = window.location.href.includes('localhost');
const sceneToLoad = isDev ? path.split('/').filter(Boolean).pop() ?? 'title' : 'title'


async function loadAssets() {
    await loadDefaultFont();
    initRenderer();
    loadScene(sceneToLoad);
}

loadAssets().then(animate)

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    const {scene, camera, update} = getScene();
    const renderer = getRenderer();

    update?.(delta); // Call scene-specific update logic

    if (scene && camera && renderer) {
        renderer.render(scene, camera);
    }
}

animate();
