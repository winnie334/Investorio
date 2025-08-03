import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';

import {TextGeometry, type TextGeometryParameters} from 'three/examples/jsm/geometries/TextGeometry.js';
import {Font, FontLoader} from 'three/addons/loaders/FontLoader.js';

import buyButtonUrl from './assets/models/BuyButton.glb';
import sellButtonUrl from './assets/models/SellButton.glb';
import quantityMinusUrl from './assets/models/QuantityMinus.glb';
import quantityPlusUrl from './assets/models/QuantityPlus.glb';
import textBubbleUrl2 from './assets/models/TextBubble.glb';
import panelUrl from './assets/models/panel.glb';
import screenUrl from './assets/models/screen.glb';
import appleUrl from './assets/models/apple.glb';
import fishUrl from './assets/models/fish.glb';
import planet from './assets/models/planet.glb';
import potato from './assets/models/potato.glb';
import snowball from './assets/models/snowball.glb';
import granny from './assets/models/granny.glb';
import monkey from './assets/models/monkey.glb';
import anonymous from './assets/models/anonymous.glb';
import you from './assets/models/you.glb';
import cash from './assets/models/cash.glb';
import dino from './assets/models/dino.fbx';
import cash2 from './assets/models/Cheque.glb';

import {
    Camera,
    Group,
    Scene,
    Vector3,
    Euler,
    Mesh,
    MeshBasicMaterial,
    Raycaster,
    Vector2,
    BufferGeometry,
    Material, type Object3DEventMap
} from 'three';

export type InteractionCallback = (model: Group | Mesh, event?: Event) => void;

export interface ModelLoadParams {
    scene?: Scene;
    visible?: boolean;
    scale?: Vector3;
    position?: Vector3;
    rotation?: Euler;
}

export interface InteractiveModelParams extends ModelLoadParams {
    camera: Camera;
    canvas: HTMLCanvasElement;
    onClick?: InteractionCallback;
    visible?: boolean;
}

export interface TextAddParams extends ModelLoadParams {
    position?: Vector3;
    color?: number;
    visible?: boolean;
    geometryParams?: Partial<TextGeometryParameters>;

}

export interface InteractiveTextAddParams extends TextAddParams {
    scene: Scene;
    camera: Camera;
    canvas: HTMLCanvasElement;
    onClick: InteractionCallback;
}


// Constants
const defaultFontUrl = new URL('./assets/fonts/nata.json', import.meta.url).href;
export const defaultScale = new Vector3(1, 1, 1);
export const defaultPosition = new Vector3(0, 0, 0);
export const defaultRotation = new Euler(0, 0, 0);
const defaultTextGeometryParams: Partial<TextGeometryParameters> = {
    size: 1,
    depth: 0.1,
};

// Model URLs
export const buyButtonModelUrl = buyButtonUrl;
export const sellButtonModelUrl = sellButtonUrl;
export const quantityMinusModelUrl = quantityMinusUrl;
export const quantityPlusModelUrl = quantityPlusUrl;
export const textBubbleUrl1 = textBubbleUrl2;
export const panelModelUrl = panelUrl;
export const screenModelUrl = screenUrl;
export const appleModelUrl = appleUrl;
export const planetModelUrl = planet;
export const fishModelUrl = fishUrl;
export const snowballModelUrl = snowball;
export const potatoModelUrl = potato;
export const youUrl = you;
export const grannyModelUrl = granny;
export const monkeyModelUrl = monkey;
export const narratorModelUrl = anonymous;
export const cashModelUrl = cash;
export const dinoModelUrl = dino;

// Loaders
const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader();
const fontLoader = new FontLoader();

// Font state
let defaultFont: Font | undefined = undefined;

function getLoader(url: string): GLTFLoader | FBXLoader {
    return url.toLowerCase().endsWith('.fbx') ? fbxLoader : gltfLoader;
}

export async function loadModel(url: string, params: ModelLoadParams = {}): Promise<Group | undefined> {
    const {
        scene,
        visible = true,
        scale = defaultScale,
        position = defaultPosition,
        rotation = defaultRotation
    } = params;

    try {
        const loader = getLoader(url);

        const model = loader instanceof GLTFLoader
            ? (await loader.loadAsync(url)).scene
            : await loader.loadAsync(url);

        model.scale.copy(scale);
        model.position.copy(position);
        model.rotation.copy(rotation);
        model.visible = visible;


        scene?.add(model);

        return model;
    } catch (error) {
        console.error(`Error loading model ${url}:`, error);
    }
}

export async function loadModelInteractive(
    url: string,
    params: InteractiveModelParams
): Promise<[Group, () => void] | undefined> {
    const {scene, camera, canvas, visible, onClick, scale, position, rotation} = params;

    const model = await loadModel(url, {scene, visible, scale, position, rotation});
    if (!model || !onClick) return;

    const raycaster = new Raycaster();
    const mouse = new Vector2();

    function handleClick(event: MouseEvent) {
        if (!model || !onClick) return;
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(model, true);

        if (intersects.length > 0) {
            onClick(model, event);
        }
    }

    canvas.addEventListener('click', handleClick);

    return [model, () => canvas.removeEventListener('click', handleClick)];
}

export async function loadFont(fontUrl: string): Promise<Font | undefined> {
    try {
        console.log('Loading font', fontUrl);
        return await fontLoader.loadAsync(fontUrl);
    } catch (error) {
        console.error(`Error loading font ${fontUrl}:`, error);
    }
}

export async function loadDefaultFont() {
    defaultFont = await loadFont(defaultFontUrl);
}

export function addText(title: any, params: TextAddParams = {}): Mesh | undefined {
    if (!defaultFont) {
        console.error('Default font not loaded');
        return;
    }

    const {
        position = new Vector3(0, 0, 0),
        rotation = new Euler(),
        scale = defaultScale,
        color = 0x00ff00,
        visible = true,
        geometryParams = {},
        scene
    } = params;

    const textGeometry = new TextGeometry(title.toString(), {
        font: defaultFont,
        ...defaultTextGeometryParams,
        ...geometryParams,
    });

    const material = new MeshBasicMaterial({color, transparent: true, opacity: 1});
    const textMesh = new Mesh(textGeometry, material);
    textMesh.position.copy(position);
    textMesh.rotation.copy(rotation);
    textMesh.scale.copy(scale);
    textMesh.visible = visible;
    scene?.add(textMesh);

    return textMesh;
}

export function addInteractiveText(
    title: string,
    params: InteractiveTextAddParams
): [Mesh, () => void] | undefined {
    if (!defaultFont) {
        console.error('Default font not loaded');
        return;
    }

    const {
        scene,
        camera,
        canvas,
        onClick,
        position = defaultPosition,
        rotation = defaultRotation,
        scale = defaultScale,
        color = 0x00ff00,
        geometryParams = {}
    } = params;

    const textGeometry = new TextGeometry(title, {
        font: defaultFont,
        ...defaultTextGeometryParams,
        ...geometryParams,
    });

    const material = new MeshBasicMaterial({color});
    const textMesh = new Mesh(textGeometry, material);
    textMesh.position.copy(position);
    textMesh.scale.copy(scale);
    textMesh.rotation.copy(rotation);
    scene.add(textMesh);

    const raycaster = new Raycaster();
    const mouse = new Vector2();

    function handleClick(event: MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(textMesh, true);

        if (intersects.length > 0) {
            onClick(textMesh, event);
        }
    }

    canvas.addEventListener('click', handleClick);

    return [textMesh, () => {
        canvas.removeEventListener('click', handleClick);
        scene.remove(textMesh);
    }];
}

export function updateTextValue(textMesh: Mesh | Mesh[] | undefined, newText: any, geometryParams: Partial<TextGeometryParameters> = {}) {
    if (!defaultFont || textMesh === undefined) {
        console.error('Update text called before font and mesh initialized');
        return;
    }

    const newGeometry = new TextGeometry(newText.toString(), {font: defaultFont, ...defaultTextGeometryParams, ...geometryParams,});

    textMesh.geometry.dispose();
    textMesh.geometry = newGeometry;
}
