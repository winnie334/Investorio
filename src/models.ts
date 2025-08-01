import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import buyButtonUrl from "./assets/models/BuyButton.glb";
import dinoUrl from "./assets/models/dino.fbx";
import {Camera, Group, Raycaster, Scene, Vector2, Vector3} from "three";
import * as THREE from 'three';
import {TextGeometry, type TextGeometryParameters} from 'three/examples/jsm/geometries/TextGeometry.js';
import {FontLoader, Font} from 'three/addons/loaders/FontLoader.js';

const defaultFontUrl = new URL('./assets/fonts/undoredo.json', import.meta.url).href;

const fontLoader = new FontLoader();

type InteractionCallback = (model: Group, event?: Event) => void;

export const dinoModelUrl = dinoUrl;
export const buyButtonModelUrl = buyButtonUrl;

const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader();

const defaultScale = new Vector3(1, 1, 1);
const defaultPosition = new Vector3(0, 0, 0);

function getLoader(url: string): GLTFLoader | FBXLoader {
    return url.toLowerCase().endsWith('.fbx') ? fbxLoader : gltfLoader;
}


export async function loadModel(
    url: string,
    scene?: Scene,
    scale: Vector3 = defaultScale,
    position: Vector3 = defaultPosition
): Promise<Group | undefined> {
    try {
        const loader = getLoader(url);

        const model = loader instanceof GLTFLoader
            ? (await loader.loadAsync(url)).scene
            : await loader.loadAsync(url);

        model.scale.copy(scale);
        model.position.copy(position);

        if (scene) scene.add(model);

        return model;
    } catch (error) {
        console.error(`Error loading model ${url}:`, error);
    }
}

export async function loadModelInteractive(
    url: string,
    scene: Scene,
    camera: Camera,
    canvas: HTMLCanvasElement,
    onClick?: InteractionCallback,
    scale: Vector3 = defaultScale,
    position: Vector3 = defaultPosition,
): Promise<[Group, () => void] | undefined> {
    const model = await loadModel(url, scene, scale, position);
    if (!model) return

    if (!onClick) return

    const raycaster = new Raycaster();
    const mouse = new Vector2();

    function handleClick(event: MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        if (!model) {
            console.error('Handle click called without model');
            return;
        }

        if (!onClick) {
            console.error('Handle click callback not set');
            return;
        }

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(model, true);

        if (intersects.length > 0) {
            onClick(model, event);
        }
    }

    canvas.addEventListener('click', handleClick);

    return [model, () => {
        canvas.removeEventListener('click', handleClick);
    }];
}


export async function loadFont(fontUrl: string) {
    try {
        console.log('Loading font', fontUrl);
        return await fontLoader.loadAsync(fontUrl);
    } catch (error) {
        console.error(`Error loading font ${fontUrl}:`, error);
    }
}

let defaultFont: Font | undefined = undefined;

export async function loadDefaultFont() {
    // @ts-ignore
    defaultFont = await loadFont(defaultFontUrl)
}

const defaultTextGeometryParams: Partial<TextGeometryParameters> = {
    size: 1,
    depth: 0.1
};

export async function addText(
    title: string,
    scene?: Scene,
    color = 0x00ff0,
    userParams: Partial<TextGeometryParameters> = {},
) {
    if (!defaultFont) {
        console.error('Default font not loaded');
        return undefined;
    }

    const textGeometry = new TextGeometry(title, {
        font: defaultFont,
        ...defaultTextGeometryParams,
        ...userParams,
    });

    const material = new THREE.MeshBasicMaterial({color});
    const text = new THREE.Mesh(textGeometry, material);


    scene?.add(text);
    return text;
}
