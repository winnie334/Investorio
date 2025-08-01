import {getRenderer, initRenderer} from "./scene/initRenderer.ts";
import {getScene, loadScene} from "./scene/sceneManager.ts";

let lastTime = performance.now();

initRenderer();
loadScene('title');

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
