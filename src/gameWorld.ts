import * as THREE from "three";
import {Euler, MeshBasicMaterial, Vector3} from "three";
import {getGameLogic, Stock} from "./gameLogic.ts";
import {loadGraphModel} from "./graph.ts";
import {
    addText,
    appleModelUrl,
    buyButtonModelUrl,
    fishModelUrl,
    loadModel,
    loadModelInteractive,
    panelModelUrl,
    planetModelUrl,
    quantityMinusModelUrl,
    quantityPlusModelUrl,
    screenModelUrl,
    sellButtonModelUrl,
    snowballModelUrl, potatoModelUrl, addInteractiveText, grannyModelUrl, monkeyModelUrl,
} from "./models.ts";

const gameWorld = createGameWorld();

export function getGameWorld() {
    return gameWorld
}

function createGameWorld() {
    let isLoaded = false


    let roomObjects: Record<string, THREE.Mesh | THREE.Mesh[]> | undefined

    function isGameWorldLoaded() {
        return isLoaded;
    }

    async function createRoom(scene: THREE.Scene, camera: THREE.Camera, canvas: HTMLCanvasElement) {
        isLoaded = false
        const gameLogic = getGameLogic();

        // Ambient light
        scene.add(new THREE.AmbientLight(0xffffff, 0.2));

        // Directional light
        const dirLight = new THREE.DirectionalLight(0xfff8e7, 1);
        dirLight.position.set(20, 50, 20);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.set(2048, 2048);
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 100;
        scene.add(dirLight);


        // Spotlight from above
        const spotLight = new THREE.SpotLight(0xfffacd, 1.5, 100, Math.PI / 6, 0.3, 1);
        spotLight.position.set(0, 30, 0);
        spotLight.castShadow = true;
        spotLight.target.position.set(0, 0, -30);
        scene.add(spotLight);
        scene.add(spotLight.target);


        // Room dimensions
        const textureLoader = new THREE.TextureLoader();
        const wallTexture = textureLoader.load('/textures/wood.jpg');
        const floorTexture = textureLoader.load('/textures/woodfloor.jpg');
        wallTexture.needsUpdate = true;

        const wallMaterial = new THREE.MeshStandardMaterial({map: wallTexture});
        const floorMaterial = new THREE.MeshStandardMaterial({map: floorTexture});

        const wallHeight = 30;
        const wallThickness = 0.5;
        const roomDepth = 30;
        const roomWidth = 21;

        // Platform
        const platform = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, 1, roomDepth), floorMaterial);
        platform.position.y = -0.5;
        platform.receiveShadow = true;
        platform.scale.z *= 2;
        scene.add(platform);

        // Back wall
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, wallHeight, wallThickness), wallMaterial);
        backWall.position.set(0, wallHeight / 2, -roomDepth / 2);
        backWall.receiveShadow = true;
        scene.add(backWall);

        loadModelInteractive(grannyModelUrl, {
            scene,
            camera,
            canvas,
            onClick: () => {
                console.log("I am a granny")
            },
            scale: new Vector3(1.5, 1.5, 1.5),
            position: new Vector3(-8, -1, 8),
        })


        loadModelInteractive(monkeyModelUrl, {
            scene,
            camera,
            canvas,
            onClick: () => {
                console.log("I am a granny")
            },
            scale: new Vector3(0.8, 0.8, 0.8),
            position: new Vector3(7, 2, 8),
            rotation: new Euler(0, -Math.PI/2, 0),
        })


        const modelConfigs = [
            {
                url: appleModelUrl,
                position: new Vector3(-8, 5, -12),
                scale: new Vector3(1.5, 1.5, 1.5),
            },
            {
                url: potatoModelUrl,
                position: new Vector3(-4, 3.5, -12),
                scale: new Vector3(0.012, 0.012, 0.012),
            },
            {
                url: fishModelUrl,
                position: new Vector3(0, 3.8, -12),
                scale: new Vector3(0.35, 0.35, 0.35),
            },
            {
                url: snowballModelUrl,
                position: new Vector3(4, 5.5, -12),
                scale: new Vector3(1.5, 1.5, 1.5),
            },
            {
                url: planetModelUrl,
                position: new Vector3(8, 4, -12),
                scale: new Vector3(1.5, 1.5, 1.5),
            },
        ];

        const selectStockModels: THREE.Object3D[] = [];

        for (const [index, config] of modelConfigs.entries()) {
            const [model] = await loadModelInteractive(config.url, {
                scene,
                camera,
                canvas,
                onClick: () => {
                    gameLogic.selectStock(index); // Use index as Stock
                },
                position: config.position,
                scale: config.scale,
            });

            // Apply hologram style by default
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material.transparent = true;
                    child.material.opacity = 0.3;
                }
            });

            selectStockModels[index] = model;
        }


        // Left wall
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, roomDepth), wallMaterial);
        leftWall.position.set(-roomWidth / 2, wallHeight / 2, 0);
        leftWall.receiveShadow = true;
        scene.add(leftWall);

        // Right wall
        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, roomDepth), wallMaterial);
        rightWall.position.set(roomWidth / 2, wallHeight / 2, 0);
        rightWall.receiveShadow = true;
        scene.add(rightWall);


        loadGraphModel(scene, -4, 6, -14, new Euler(Math.PI / 2, 0, 0), 4);


        // Buy/Sell/Quantity buttons
        // @ts-ignore
        const [buyButton,] = await loadModelInteractive(buyButtonModelUrl, {
            scene,
            camera,
            canvas,
            onClick: () => gameLogic.buyStock(),
            position: new Vector3(-3.8, 3.3, 19),
            scale: new Vector3(0.5, 0.5, 0.5),
            rotation: new Euler(Math.PI / 5, 0, 0),
        });

        const [sellButton,] = await loadModelInteractive(sellButtonModelUrl, {
            scene,
            camera,
            canvas,
            onClick: () => gameLogic.sellStock(),
            position: new Vector3(-3.8, 2.5, 20),
            scale: new Vector3(0.5, 0.5, 0.5),
            rotation: new Euler(Math.PI / 5, 0, 0),
        });

        const [plusButton,] = await loadModelInteractive(quantityPlusModelUrl, {
            scene,
            camera,
            canvas,
            onClick: () => gameLogic.incrementQuantity(),
            position: new Vector3(-6.3, 3.2, 19.5),
            scale: new Vector3(2, 2, 2),
            rotation: new Euler(Math.PI / 5, -Math.PI/2, 0),
        });

        const [minusButton,] = await loadModelInteractive(quantityMinusModelUrl, {
            scene,
            camera,
            canvas,
            onClick: () => gameLogic.decrementQuantity(),
            position: new Vector3(-6.3, 3.2, 19.5),
            scale: new Vector3(2, 2, 2),
            rotation: new Euler(Math.PI / 5, -Math.PI/2, 0),
        });

        const panel = await loadModel(panelModelUrl, {
            scene,
            position: new Vector3(0, -8, 18),
            rotation: new Euler(0, -Math.PI / 2, 0),
            scale: new Vector3(0.8, 0.8, 0.8),

        });


        // Amount to invest display
        const quantityElement = addText(gameLogic.getQuantity(), {
            position: new Vector3(-3.7, 5.6, 17),
            rotation: new Euler(-Math.PI / 5, 0, 0),
            scale: new Vector3(0.7, 0.7, 0.7),
            color: 0x000000,
            scene
        });

        // Total order preview
        const orderElement = addText("$0", {
            position: new Vector3(-4.7, 4.3, 19),
            rotation: new Euler(-Math.PI / 5, 0, 0),
            scale: new Vector3(0.5, 0.5, 0.5),
            color: 0x000000,
            scene
        });

        const screen = await loadModel(screenModelUrl, {
            scene,
            position: new Vector3(1.5, 4, 18),
            scale: new Vector3(3.5, 2.5, 2.5),
            rotation: new Euler(Math.PI / 5, 0, 0),

        });

        const balance = addText(``, {
            position: new Vector3(-1.1, 5, 17),
            scale: new Vector3(0.3, 0.3, 0.3),
            rotation: new Euler(-Math.PI / 5, 0, 0),
            scene
        });

        const invested = addText(`}`, {
            position: new Vector3(-1.1, 4.9, 17.6),
            scale: new Vector3(0.3, 0.3, 0.3),
            rotation: new Euler(-Math.PI / 5, 0, 0),
            scene
        });

        const profit = addText(``, {
            position: new Vector3(-1.1, 4.8, 18.2),
            scale: new Vector3(0.3, 0.3, 0.3),
            rotation: new Euler(-Math.PI / 5, 0, 0),
            scene
        });

        const selectedStock = addText(``, {
            position: new Vector3(-1.1, 4.7, 18.8),
            scale: new Vector3(0.3, 0.3, 0.3),
            rotation: new Euler(-Math.PI / 5, 0, 0),
            scene
        });
        addText("Portfolio:", {
            position: new Vector3(-1.1, 4.6, 19.4),
            scale: new Vector3(0.3, 0.3, 0.3),
            rotation: new Euler(-Math.PI / 5, 0, 0),
            scene
        });


        const offsetY = -0.05;
        const offsetZ = 0.4;
        const baseY = 4.5;
        const baseZ = 19.7;

        const portFolioTexts = Object.keys(gameLogic.getPortfolio()).map((stock, index) => {
            const positionY = baseY + index * offsetY;
            const positionZ = baseZ + index * offsetZ;

            return addText("", {
                position: new Vector3(1, positionY, positionZ),
                scale: new Vector3(0.2, 0.2, 0.2),
                rotation: new Euler(-Math.PI / 5, 0, 0),
                scene
            });
        });


        isLoaded = true

        const year = addText(`Year: 0`, {
            position: new Vector3(-8, 21, -13),
            scene
        })


        if (!balance || !profit || !orderElement || !portFolioTexts || !profit || !selectedStock) {
            console.error("One of the room objects is missing");
            return;
        }
        roomObjects = {
            balance,
            profit,
            quantityElement: quantityElement,
            minusButton,
            plusButton,
            buyButton,
            sellButton,
            portFolioTexts: portFolioTexts,
            orderElement: orderElement,
            selectStockModels,
            selectedStock,
            invested,
            year
        };

        gameLogic.updateAllUI()

    }

    function getRoomObjects() {
        return roomObjects;
    }

    return {createRoom, isGameWorldLoaded, getRoomObjects};
}
