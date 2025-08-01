// sceneManager.ts
import * as THREE from 'three';
import {createTitleScreen} from "./scenes/TitleScreen.scene.ts";
import {createGameScreen} from "./scenes/Game.scene.ts";

type SceneFactory = () => { scene: THREE.Scene; camera: THREE.Camera, update?: (delta: number) => void };

export type SceneKey = keyof typeof sceneRegistry;

let currentScene: THREE.Scene;
let currentCamera: THREE.Camera;
let currentUpdate: ((delta: number) => void) | undefined;

export const sceneRegistry: Record<string, SceneFactory> = {
    title: createTitleScreen,
    game: createGameScreen,
};

export function loadScene(key: SceneKey) {
    const factory = sceneRegistry[key];
    if (!factory) throw new Error(`Scene '${key}' not registered`);

    const {scene, camera, update} = factory();
    currentScene = scene;
    currentCamera = camera;
    currentUpdate = update;
}

export function getScene() {
    return {scene: currentScene, camera: currentCamera, update: currentUpdate};
}