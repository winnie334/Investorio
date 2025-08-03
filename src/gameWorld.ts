import * as THREE from "three";
import {Euler, MeshBasicMaterial, Vector3} from "three";
import {CASH_VALUE, getGameLogic, Stock} from "./gameLogic.ts";
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
    textBubbleUrl1,
    screenModelUrl,
    sellButtonModelUrl,
    snowballModelUrl,
    potatoModelUrl,
    addInteractiveText,
    youUrl,
    grannyModelUrl,
    monkeyModelUrl,
    narratorModelUrl,
    cashModelUrl, updateTextValue,
} from "./models.ts";
import {loadMonkeyComparator} from "./monkeyComparator.ts";
import {playSound, type SoundKey} from "./soundManager.ts";

const gameWorld = createGameWorld();

export enum Character {
    MONKEY,
    GRANNY,
    NARRATOR
}

export function getGameWorld() {
    return gameWorld
}

function createGameWorld() {
    let isLoaded = false


    let roomObjects: Record<string, THREE.Mesh | THREE.Mesh[]> | undefined
    const cashObjects = new Map<string, THREE.Mesh>();
    const characterPortraits: Record<Character, THREE.Mesh | undefined> = {
        [Character.GRANNY]: undefined,
        [Character.MONKEY]: undefined,
        [Character.NARRATOR]: undefined,
    }

    function isGameWorldLoaded() {
        return isLoaded;
    }

    let scene: THREE.Scene
    let camera: THREE.Camera
    let canvas: HTMLCanvasElement

    function init(newScene: THREE.Scene, newCamera: THREE.Camera, newCanvas: HTMLCanvasElement) {
        scene = newScene
        camera = newCamera
        canvas = newCanvas
    }

    async function createRoom() {
        if (!scene || !camera || !canvas) return
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

        loadMonkeyComparator({
            scene,
            width: 20,
            rotation: new Euler(0, Math.PI / 2, 0),
            position: new Vector3(-4.5, 16.8, -14)
        });

        loadModelInteractive(grannyModelUrl, {
            scene,
            camera,
            canvas,
            onClick: () => {
                console.log("I am a granny")
            },
            scale: new Vector3(1.3, 1.3, 1.3),
            rotation: new Euler(Math.PI / 2, 0, 0),
            position: new Vector3(-6.65, 16.7, -13),
        })


        loadModelInteractive(monkeyModelUrl, {
            scene,
            camera,
            canvas,
            onClick: () => {
                console.log("I am a granny")
            },
            scale: new Vector3(1.3, 1.3, 1.3),
            rotation: new Euler(Math.PI / 2, 0, 0),
            position: new Vector3(-6.65, 19.6, -13),
        })

        loadModelInteractive(youUrl, {
            scene,
            camera,
            canvas,
            onClick: () => {
                console.log("I am a granny")
            },
            scale: new Vector3(1.3, 1.3, 1.3),
            rotation: new Euler(Math.PI / 2, 0, 0),
            position: new Vector3(-6.65, 22.5, -13),
        })

        const modelConfigs = [
            {
                url: appleModelUrl,
                position: new Vector3(-8, 2, -12),
                scale: new Vector3(1.5, 1.5, 1.5),
            },
            {
                url: potatoModelUrl,
                position: new Vector3(-4, 0.5, -12),
                scale: new Vector3(0.012, 0.012, 0.012),
            },
            {
                url: fishModelUrl,
                position: new Vector3(0, 0.8, -12),
                scale: new Vector3(0.35, 0.35, 0.35),
            },
            {
                url: snowballModelUrl,
                position: new Vector3(4, 2.5, -12),
                scale: new Vector3(1.5, 1.5, 1.5),
            },
            {
                url: planetModelUrl,
                position: new Vector3(8, 1, -12),
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


        loadGraphModel(scene, -4, 2, -14, new Euler(Math.PI / 2, 0, 0), 4);


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
            rotation: new Euler(Math.PI / 5, -Math.PI / 2, 0),
        });

        const [minusButton,] = await loadModelInteractive(quantityMinusModelUrl, {
            scene,
            camera,
            canvas,
            onClick: () => gameLogic.decrementQuantity(),
            position: new Vector3(-6.3, 3.2, 19.5),
            scale: new Vector3(2, 2, 2),
            rotation: new Euler(Math.PI / 5, -Math.PI / 2, 0),
        });

        const [textBubble,] = await loadModelInteractive(textBubbleUrl1, {
            scene,
            camera,
            canvas,
            onClick: () => console.log(".."),
            position: new Vector3(1, 5.2, 7),
            scale: new Vector3(4, 4, 4),
            rotation: new Euler(-Math.PI / 7, Math.PI / 2, 0),
            visible: false,
        });
        textBubble.receiveShadow = false;

        const panel = await loadModel(panelModelUrl, {
            scene,
            position: new Vector3(0, -8, 18),
            rotation: new Euler(0, -Math.PI / 2, 0),
            scale: new Vector3(0.8, 0.8, 0.8),

        });

        const textBubbleElement = addText("Heyo", {
            position: new Vector3(-5.8, 6.2, 7.2),
            scale: new Vector3(0.6, 0.6, 0.6),
            rotation: new Euler(-Math.PI / 7, 0, 0),
            color: 0x000000,
            visible: false,
            scene
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
            position: new Vector3(-1.1, 5.2, 17),
            scale: new Vector3(0.3, 0.3, 0.3),
            rotation: new Euler(-Math.PI / 5, 0, 0),
            scene
        });

        const invested = addText(`}`, {
            position: new Vector3(-1.1, 5.1, 17.6),
            scale: new Vector3(0.3, 0.3, 0.3),
            rotation: new Euler(-Math.PI / 5, 0, 0),
            scene
        });

        const profit = addText(``, {
            position: new Vector3(-1.1, 5, 18.2),
            scale: new Vector3(0.3, 0.3, 0.3),
            rotation: new Euler(-Math.PI / 5, 0, 0),
            scene
        });

        const selectedStock = addText(``, {
            position: new Vector3(-8.2, 3.8, -13.8),
            color: 0x000000,
            scene
            // position: new Vector3(-1.1, 4.7, 18.8),
            // scale: new Vector3(0.3, 0.3, 0.3),
            // rotation: new Euler(-Math.PI / 5, 0, 0),
            // scene
        });
        addText("---------------------Portfolio", {
            position: new Vector3(-1.09, 5.4, 19.4),
            scale: new Vector3(0.28, 0.28, 0.28),
            rotation: new Euler(-Math.PI / 5, 0, 0),
            scene
        });


        const offsetY = -0.2;
        const offsetZ = 0.4;
        const baseY = 5.2;
        const baseZ = 19.7;

        const portFolioTexts = Object.keys(gameLogic.getPortfolio()).map((stock, index) => {
            const positionY = baseY + index * offsetY;
            const positionZ = baseZ + index * offsetZ;

            return addText("", {
                position: new Vector3(-1.1, positionY, positionZ),
                scale: new Vector3(0.25, 0.25, 0.25),
                rotation: new Euler(-Math.PI / 5, 0, 0),
                scene
            });
        });


        isLoaded = true

        const year = addText(`Year: 0`, {
            position: new Vector3(2.6, 5, 17),
            scale: new Vector3(0.3, 0.3, 0.3),
            rotation: new Euler(-Math.PI / 5, 0, 0),
            scene
        })

        // text on the graph, aka end text
        const graphText = addText(``, {
            position: new Vector3(-7.4, 12, -13.8),
            color: 0x000000,
            scene
        })


        generateChatBubble()


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
            textBubble,
            textBubbleElement,
            selectedStock,
            graphText,
            invested,
            year
        };

        gameLogic.updateAllUI()

    }

    let i = 0

    async function spawnCash() {
        const gameLogic = getGameLogic();
        const id = `${i++}`;

        const [cash, clearCash] = await loadModelInteractive(cashModelUrl, {
            scene,
            camera,
            canvas,
            onClick: () => {
                clearCash();
                gameLogic.addToBalance(CASH_VALUE);
                playSound("SELL", 0.1)
                cashObjects.delete(id);
                scene.remove(cash);
            },
            scale: new Vector3(2, 2, 2),
            position: new Vector3(0, 1, 0),
        });

        cashObjects.set(id, cash);
        return cash;
    }

    let bubbleMesh: THREE.Mesh;

    async function generateChatBubble() {
        const bubbleWidth = 18;
        const bubbleHeight = 5;
        const radius = 1;

        // 1. Rounded rectangle background
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

        // load in character portraits
        const [granny, monkey, narrator] = await Promise.all([
            loadModel(grannyModelUrl, {
                scene,
                scale: new Vector3(1.1, 1.1, 1.1),
                rotation: new Euler(Math.PI / 2, 0, 0),
                position: new Vector3(-7.5, 5, 8),
            }),
            loadModel(monkeyModelUrl, {
                scene,
                scale: new Vector3(1.1, 1.1, 1.1),
                rotation: new Euler(Math.PI / 2, 0, 0),
                position: new Vector3(-7.5, 5, 8),
            }),
            loadModel(narratorModelUrl, {
                scene,
                scale: new Vector3(1.1, 1.1, 1.1),
                rotation: new Euler(Math.PI / 2, 0, 0),
                position: new Vector3(-7.5, 5, 8),
            }),
        ]);

        granny.visible = false;
        granny.receiveShadow = false;
        monkey.visible = false;
        monkey.receiveShadow = false;
        narrator.visible = false;
        narrator.receiveShadow = false;

        characterPortraits[Character.GRANNY] = granny;
        characterPortraits[Character.MONKEY] = monkey;
        characterPortraits[Character.NARRATOR] = narrator;


        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        bubbleMesh = new THREE.Mesh(geometry, material);
        bubbleMesh.position.set(0, 5, 8);
        bubbleMesh.visible = false;
        scene.add(bubbleMesh);
    }

    type ShowTextOptions = {
        onDone?: () => void;
        character?: Character;
        fadeout?: boolean;
    };


    function showText(
        text: string,
        options: ShowTextOptions = {}
    ) {
        const {onDone, character, fadeout} = options;
        const characterToUse = character || Character.NARRATOR;

        bubbleMesh.visible = true;
        characterPortraits[characterToUse].visible = true;

        bubbleMesh.material.opacity = 0.6;

        characterPortraits[characterToUse].traverse((child: any) => {
            if (child.isMesh && child.material?.transparent !== undefined) {
                child.material.transparent = true;
                child.material.opacity = 1.0;
            }
        });

        const maxCharsPerLine = 42;
        const wrappedTextLines = wrapText(text, maxCharsPerLine);

        const textObjects: { object: any; line: string }[] = wrappedTextLines.map((line, i) => {
            const lineText = addText('', {
                position: new THREE.Vector3(-6, 5.6 - i * 0.8, 8.01),
                scale: new THREE.Vector3(0.5, 0.5, 0.5),
                color: 0xffffff,
                scene,
            });
            return {object: lineText, line};
        });

        animateTextReveal(textObjects, 30, () => { // fade out dialogue after last character is printed
            setTimeout(() => {
                fadeOutText(bubbleMesh, characterPortraits[characterToUse], textObjects, fadeout ? 500 : 0, cleanup);
            }, 1000);
        });

        let timeoutId: number | undefined;

        const cleanup = () => {
            textObjects.forEach(({object}) => scene.remove(object));

            bubbleMesh.visible = false;
            characterPortraits[characterToUse].visible = false;

            window.removeEventListener('click', onClick);
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
                timeoutId = undefined;
            }

            if (onDone) onDone();
        };

        const onClick = () => {
            cleanup();
        };

        window.addEventListener('click', onClick);
    }


    function fadeOutText(bubble: THREE.Mesh, portrait: THREE.Object3D, textObjects: THREE.Mesh[], fadeDuration = 500, onComplete?: () => void) {
        const start = performance.now();


        function animate() {
            const now = performance.now();
            const elapsed = now - start;
            const t = Math.min(elapsed / fadeDuration, 1);
            const opacity = 1 - t;

            if (bubble.material && 'opacity' in bubble.material) {
                bubble.material.opacity = opacity * 0.6;
            }

            portrait.traverse((child: any) => {
                if (child.isMesh && child.material?.transparent !== undefined) {
                    child.material.opacity = opacity;
                }
            });

            textObjects.forEach(({object}) => {
                object.traverse((child: any) => {
                    if (child.isMesh && child.material?.transparent !== undefined) {
                        child.material.opacity = opacity;
                    }
                });
            });


            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                bubble.visible = false;
                portrait.visible = false;
                if (onComplete) onComplete();
            }
        }

        animate();
    }


    function wrapText(text, maxCharsPerLine) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine.length === 0 ? word : `${currentLine} ${word}`;
            if (testLine.length > maxCharsPerLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    }

    function animateTextReveal(textObjects, delay = 50, onComplete?: () => void) {
        let currentLine = 0;
        let currentChar = 0;

        function update() {
            if (currentLine >= textObjects.length) return;

            const {object, line} = textObjects[currentLine];
            const partial = line.slice(0, currentChar + 1);
            object.text = partial;
            updateTextValue(object, partial)
            currentChar++;

            if (currentChar >= line.length) {
                currentLine++;
                currentChar = 0;
            }

            if (currentLine < textObjects.length) {
                setTimeout(update, delay);
            } else {
                if (onComplete) onComplete();
            }
        }

        update();
    }


    function getRoomObjects() {
        return roomObjects;
    }

    function getCashObjects() {
        return cashObjects;
    }

    return {createRoom, isGameWorldLoaded, getRoomObjects, init, spawnCash, getCashObjects, showText};
}
