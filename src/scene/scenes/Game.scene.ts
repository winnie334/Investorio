import * as THREE from 'three';
import {getRenderer} from '../initRenderer.ts';
import {fitToPortrait} from '../../helpers/layout.ts';
import {getGameLogic, Stock} from "../../gameLogic.ts";
import {loadGraphModel} from "../../graph.ts";
import {
    addInteractiveText,
    addText,
    buyButtonModelUrl,
    loadModelInteractive, quantityMinusModelUrl, quantityModelUrl, quantityPlusModelUrl,
    sellButtonModelUrl,
    updateTextValue
} from "../../models.ts";
import {Euler, Vector3} from "three";


function createRoom(scene: THREE.Scene, camera: THREE.Camera, canvas: any) {
    const gameLogic = getGameLogic()

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
    spotLight.position.set(0, 80, 0);
    spotLight.castShadow = true;
    spotLight.target.position.set(0, 0, -30);
    scene.add(spotLight);
    scene.add(spotLight.target);


    // Room dimensions
    const wallMaterial = new THREE.MeshStandardMaterial({color: 0x444444});
    const wallHeight = 20;
    const wallThickness = 0.5;
    const roomDepth = 30;
    const roomWidth = 21;

    // Platform
    const platform = new THREE.Mesh(
        new THREE.BoxGeometry(roomWidth, 1, roomDepth),
        new THREE.MeshStandardMaterial({color: 0x2c2c2c})
    );
    platform.position.y = -0.5;
    platform.receiveShadow = true;
    scene.add(platform);

    // Back wall
    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(roomWidth, wallHeight, wallThickness),
        wallMaterial
    );
    backWall.position.set(0, wallHeight / 2, -roomDepth / 2);
    backWall.castShadow = true;
    scene.add(backWall);


    // Left wall
    const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, roomDepth),
        wallMaterial
    );
    leftWall.position.set(-roomWidth / 2, wallHeight / 2, 0);
    leftWall.castShadow = true;
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, roomDepth),
        wallMaterial
    );
    rightWall.position.set(roomWidth / 2, wallHeight / 2, 0);
    rightWall.castShadow = true;
    scene.add(rightWall);

    loadGraphModel(scene, -4, 6, -14, new THREE.Euler(Math.PI / 2, 0, 0), 4)

    const balance = addText(gameLogic.getBalance().toString(), 0x00ff00, {}, new Vector3(-10, 6, -14), new Euler(0, 0, 0))
    scene.add(balance)


    const totalInvested = addText(gameLogic.getTotalInvested().toString(), 0x00ff00, {}, new Vector3(-6, 6, -14), new Euler(0, 0, 0))
    scene.add(totalInvested)

    const profit = addText(gameLogic.getTotalInvested().toString(), 0x00ff00, {}, new Vector3(-2, 6, -14), new Euler(0, 0, 0))
    scene.add(profit)

    const total = addText(0, 0x00ff00, {}, new Vector3(2, 6, -14), new Euler(0, 0, 0))
    scene.add(total)

    const xStart = -10;
    const xOffset = 4; // spacing between each stock label
    const y = 1;
    const z = -14;

    [...Object.values(Stock), "ALL"].forEach((stock, index) => {
        const x = xStart + index * xOffset;
        addInteractiveText(
            stock,
            scene,
            camera,
            canvas,
            () => {
                gameLogic.selectStock(stock === "ALL" ? undefined : stock);
            },
            0x00ff00,
            {},
            new Vector3(x, y, z),
            new Euler(0, 0, 0)
        );
    });

    loadModelInteractive(buyButtonModelUrl, scene, camera, canvas, () => gameLogic.buyStock(), new Vector3(1, 1, 1), new Vector3(-7, 1, 4))

    loadModelInteractive(sellButtonModelUrl, scene, camera, canvas, () => {
        gameLogic.sellStock()
    }, new Vector3(1, 1, 1), new Vector3(-7, 1, 8))

    loadModelInteractive(quantityPlusModelUrl, scene, camera, canvas, () => {
        gameLogic.setAmountToInvest(gameLogic.getAmountToInvest() + 10)
    }, new Vector3(4, 4, 4), new Vector3(3, 1, 10))

    loadModelInteractive(quantityMinusModelUrl, scene, camera, canvas, () => {
        gameLogic.setAmountToInvest(gameLogic.getAmountToInvest() - 10)
    }, new Vector3(4, 4, 4), new Vector3(6, 1, 8))

    const amountToInvest = addText(gameLogic.getAmountToInvest().toString(), 0x00ff00, {}, new Vector3(-2, 0.5, 7), new Euler(-Math.PI / 2, 0, 0))
    scene.add(amountToInvest)


    return [balance, amountToInvest, totalInvested, profit, total]
}

export function createGameScreen() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    // I do not understand why a timeout is necessary lol
    setTimeout(() => {
        camera.position.set(0, 20, 40);
        camera.lookAt(new THREE.Vector3(0, 5, 0));
    }, 10);

    const renderer = getRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    fitToPortrait(renderer, camera, canvas);

    const logic = getGameLogic()
    const [balance, amountToInvest, totalInvested, profit, total] = createRoom(scene, camera, canvas)

    logic.start()

    function update(deltaT: number) {
        const updated = logic.update(deltaT)
        if (!updated) return

        if (balance) updateTextValue(balance, logic.getBalance().toString())
        if (amountToInvest) updateTextValue(amountToInvest, logic.getAmountToInvest().toString())
        if (totalInvested) updateTextValue(totalInvested, logic.getTotalInvested().toString())
        if (profit) updateTextValue(profit, logic.getProfit().toString())
        if (total) updateTextValue(total, (logic.getProfit() + logic.getTotalInvested()).toString())
    }

    return {scene, camera, renderer, update};
}
