import * as THREE from "three";
import {getGameLogic, Stock} from "./gameLogic.ts";
import {loadGraphModel} from "./graph.ts";
import {
    addInteractiveText,
    addText,
    buyButtonModelUrl,
    loadModelInteractive,
    quantityMinusModelUrl,
    quantityPlusModelUrl,
    sellButtonModelUrl
} from "./models.ts";
import {Euler, Vector3} from "three";

const gameWorld = createGameWorld();

export function getGameWorld() {
    return gameWorld
}

function createGameWorld() {
    let isLoaded = false

    type RoomObjectKeys =
        'balance'
        | 'totalInvested'
        | 'profit'
        | 'total'
        | 'amountToInvest'
        | 'minusButton'
        | 'plusButton'
        | 'buyButton'
        | 'sellButton';
    let roomObjects: Record<RoomObjectKeys, THREE.Mesh> | undefined

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

        const wallMaterial = new THREE.MeshStandardMaterial({ map: wallTexture });
        const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });
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

        // HUD text
        const balance = addText(gameLogic.getBalance().toString(), {
            position: new Vector3(-10, 6, -14),
            rotation: new Euler(0, 0, 0),
            scene
        });

        const totalInvested = addText(gameLogic.getTotalInvested().toString(), {
            position: new Vector3(-6, 6, -14),
            rotation: new Euler(0, 0, 0),
            scene
        });

        const profit = addText(gameLogic.getTotalValue().toString(), {
            position: new Vector3(-2, 6, -14),
            rotation: new Euler(0, 0, 0),
            scene
        });

        const total = addText("0", {
            position: new Vector3(2, 6, -14),
            rotation: new Euler(0, 0, 0),
            scene
        });

        // Stock selector
        const xStart = -10;
        const xOffset = 4;
        const y = 1;
        const z = -14;

        Object.values(Stock).forEach((stock, index) => {
            const x = xStart + index * xOffset;
            addInteractiveText(stock, {
                scene,
                camera,
                canvas,
                onClick: () => gameLogic.selectStock(stock),
                position: new Vector3(x, y, z),
                rotation: new Euler(0, 0, 0)
            });
        });

        // Buy/Sell/Quantity buttons
        const [buyButton,] = await loadModelInteractive(buyButtonModelUrl, {
            scene,
            camera,
            canvas,
            onClick: () => gameLogic.buyStock(),
            position: new Vector3(-7, 1, 4),
            scale: new Vector3(1, 1, 1)
        });

        const [sellButton,] = await loadModelInteractive(sellButtonModelUrl, {
            scene,
            camera,
            canvas,
            onClick: () => gameLogic.sellStock(),
            position: new Vector3(-7, 1, 8),
            scale: new Vector3(1, 1, 1)
        });

        const [plusButton,] = await loadModelInteractive(quantityPlusModelUrl, {
            scene,
            camera,
            canvas,
            onClick: () => gameLogic.setAmountToInvest(gameLogic.getAmountToInvest() + 10),
            position: new Vector3(3, 1, 10),
            scale: new Vector3(4, 4, 4)
        });

        const [minusButton, _] = await loadModelInteractive(quantityMinusModelUrl, {
            scene,
            camera,
            canvas,
            onClick: () => gameLogic.setAmountToInvest(gameLogic.getAmountToInvest() - 10),
            position: new Vector3(6, 1, 8),
            scale: new Vector3(4, 4, 4)
        });

        // Amount to invest display
        const amountToInvest = addText(gameLogic.getAmountToInvest().toString(), {
            position: new Vector3(-2, 0.5, 7),
            rotation: new Euler(-Math.PI / 2, 0, 0),
            scene
        });

        isLoaded = true


        if (!balance || !totalInvested || !profit || !total || !amountToInvest) {
            console.error("One of the room objects is missing");
            return;
        }
        roomObjects = {
            balance,
            totalInvested,
            profit,
            total,
            amountToInvest,
            minusButton,
            plusButton,
            buyButton,
            sellButton,
        };

    }

    function getRoomObjects() {
        return roomObjects;
    }

    return {createRoom, isGameWorldLoaded, getRoomObjects};
}
