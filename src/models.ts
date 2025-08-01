import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import buyButtonUrl from "./assets/models/BuyButton.glb";
import dinoUrl from "./assets/models/dino.fbx";
import {Camera, Group, Raycaster, Scene, Vector2, Vector3} from "three";

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
) {
    const model = await loadModel(url, scene, scale, position);
    if (!model) return;
    
    if (!onClick) return;

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

    return () => {
        canvas.removeEventListener('click', handleClick);
    };
}
