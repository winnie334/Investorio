import * as THREE from 'three';
import {loadScene} from '../sceneManager.ts';
import {fitToPortrait} from '../../helpers/layout.ts';
import {getRenderer} from '../initRenderer.ts';
import {Vector3, Euler} from 'three';
import {
    addText, appleModelUrl, fishModelUrl,
    grannyModelUrl,
    loadModel,
    loadModelInteractive,
    monkeyModelUrl,
    narratorModelUrl, planetModelUrl, potatoModelUrl, snowballModelUrl, youUrl
} from "../../models.ts";
import {loadGraphModel, updateGraphData} from "../../graph.ts";
import wallTextureUrl from "../../assets/textures/wood.jpg";

function createSpeechBubble(
    position: THREE.Vector3,
    scene: THREE.Scene,
    text: string,
    title,
    character: string,
    options: {
        width?: number,
        height?: number,
        radius?: number,
        color?: number,
        opacity?: number,
    } = {}
): void {

    const bubbleWidth = options.width ?? 10;
    const bubbleHeight = options.height ?? 2.5;
    const radius = options.radius ?? 1;
    const color = options.color ?? 0x000000;
    const opacity = options.opacity ?? 0.6;

    const shape = new THREE.Shape();
    shape.moveTo(-bubbleWidth / 2 + radius, -bubbleHeight / 2);
    shape.lineTo(bubbleWidth / 2 - radius, -bubbleHeight / 2);
    shape.quadraticCurveTo(bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth / 2, -bubbleHeight / 2 + radius);
    shape.lineTo(bubbleWidth / 2, bubbleHeight / 2 - radius);
    shape.quadraticCurveTo(bubbleWidth / 2, bubbleHeight / 2, bubbleWidth / 2 - radius, bubbleHeight / 2);
    shape.lineTo(-bubbleWidth / 2 + radius, bubbleHeight / 2);
    shape.quadraticCurveTo(-bubbleWidth / 2, bubbleHeight / 2, -bubbleWidth / 2, bubbleHeight / 2 - radius);
    shape.lineTo(-bubbleWidth / 2, -bubbleHeight / 2 + radius);
    shape.quadraticCurveTo(-bubbleWidth / 2, -bubbleHeight / 2, -bubbleWidth / 2 + radius, -bubbleHeight / 2);

    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.DoubleSide
    });

    const bubbleMesh = new THREE.Mesh(geometry, material);
    bubbleMesh.position.copy(position);
    scene.add(bubbleMesh);

    loadModel(character, {
        scene,
        visible: true,
        position: new Vector3(position.x - 3.5, position.y, position.z + 0.01),
        rotation: new Euler(Math.PI / 2, 0, 0),
        scale: new Vector3(0.9, 0.9, 0.9),
    });

    addText(title, {
        scene,
        color: 0xD3D3D3,
        position: new Vector3(position.x + -2.1, position.y + 0.5, position.z + 0.01),
        scale: new Vector3(0.45, 0.45, 0.45),
    })

    addText(text, {
        scene,
        color: 0xffffff,
        position: new Vector3(position.x + -2.1, position.y - 0.2, position.z + 0.01),
        scale: new Vector3(0.4, 0.4, 0.4),
    })

}


export function createTitleScreen() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    const renderer = getRenderer();
    const canvas = renderer.domElement;
    fitToPortrait(renderer, camera, canvas);

    const ambient = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambient);

    const textureLoader = new THREE.TextureLoader();
    const wallTexture = textureLoader.load(wallTextureUrl);

    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(0.4, 1);

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 30),
        new THREE.MeshBasicMaterial({map: wallTexture})
    );
    plane.position.z = -5;
    scene.add(plane);


    const titleColor = 0x000000;
    const mainTextColor = 0x000000;
    const accentTextColor = 0x004A99

    addText("Investorio", {
        position: new Vector3(0, 10, 0),
        scale: new Vector3(1, 1, 1),
        color: titleColor,
        scene,
        center: true,
    });

    addText("Learn about investing", {
        position: new Vector3(0, 8.7, 0),
        scale: new Vector3(0.5, 0.5, 0.5),
        color: mainTextColor,
        scene,
        center: true,
    });

    addText("in a fun way (maybe)", {
        position: new Vector3(0, 7.7, 0),
        scale: new Vector3(0.5, 0.5, 0.5),
        color: mainTextColor,
        scene,
        center: true,
    });

    const clickToStartMesh = addText("Click to Start", {
        position: new Vector3(0, -8, 0),
        scale: new Vector3(0.5, 0.5, 0.5),
        color: mainTextColor,
        scene,
        center: true,
    });

    addText("© 2025 Wava Productions", {
        position: new Vector3(0, -10, 0),
        scale: new Vector3(0.3, 0.3, 0.3),
        color: accentTextColor,
        scene,
        center: true,
    });

    createSpeechBubble(new Vector3(-1, 5.5, 0), scene, "I will teach you\nthe best strategy!", "Profit Prophet", narratorModelUrl)


    let interval

    async function loadGraph() {
        loadGraphModel(scene, -2, -3.5, 0, new Euler(Math.PI / 2, 0, 0), 2)
        updateGraphData(0, 10)

        let day = 30;
        interval = setInterval(() => {
            day += 1;
            updateGraphData(0, day)
        }, 100)
    }

    loadGraph()

    let elapsedTime = 0;


    let Yoffset = 6.5
    const scalingFactor = 0.4
    const modelConfigs = [
        {
            url: appleModelUrl,
            position: new Vector3(-4, 1.1 - Yoffset, 0),
            scale: new Vector3(1.5 * scalingFactor, 1.5 * scalingFactor, 1.5 * scalingFactor),
        },
        {
            url: potatoModelUrl,
            position: new Vector3(-2, 0.5 - Yoffset, 0),
            scale: new Vector3(0.012 * scalingFactor, 0.012 * scalingFactor, 0.012 * scalingFactor),
        },
        {
            url: fishModelUrl,
            position: new Vector3(0, 0.6 - Yoffset, 0),
            scale: new Vector3(0.35 * scalingFactor, 0.35 * scalingFactor, 0.35 * scalingFactor),
        },
        {
            url: snowballModelUrl,
            position: new Vector3(2, 1.2 - Yoffset, 0),
            scale: new Vector3(1.5 * scalingFactor, 1.5 * scalingFactor, 1.5 * scalingFactor),
        },
        {
            url: planetModelUrl,
            position: new Vector3(4, 0.6 - Yoffset, 0),
            scale: new Vector3(1.5 * scalingFactor, 1.5 * scalingFactor, 1.5 * scalingFactor),
        },
    ];

    let stockModels: THREE.Object3D[] = [];
    modelConfigs.forEach((config, index) => {
        loadModel(config.url, {
            position: config.position,
            scale: config.scale,
            scene
        }).then(model => stockModels.push(model))

    })


    function start() {
        canvas.removeEventListener('click', start);
        clearInterval(interval)
        loadScene('game');
    }

    canvas.addEventListener('click', start);

    function update(deltaT: number) {
        elapsedTime += deltaT;

        // Animate pulsing scale with sine wave
        const scaleBase = 0.5;
        const scaleAmplitude = 0.1;
        const scale = scaleBase + Math.sin(elapsedTime * 3) * scaleAmplitude;

        clickToStartMesh.scale.set(scale, scale, scale);

        if (stockModels) {
            stockModels.forEach(model => {
                model.rotation.y += deltaT / 2
            })
        }
    }

    return {scene, camera, update};
}
