import {getRenderer, initRenderer} from "./scene/initRenderer.ts";
import {getScene, loadScene} from "./scene/sceneManager.ts";
import {loadDefaultFont} from "./models.ts";

let lastTime = performance.now();


async function loadAssets() {

    await loadDefaultFont();
    initRenderer();
    loadScene('title');
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
