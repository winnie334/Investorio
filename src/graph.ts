import * as THREE from 'three';
import { Scene } from 'three';

export async function loadGraphModel(scene: Scene) {
    const cubeCount = 5;

    for (let i = 0; i < cubeCount; i++) {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(`hsl(${i * 60}, 100%, 50%)`) });
      const cube = new THREE.Mesh(geometry, material);

      cube.position.set(i * 2 - (cubeCount - 1), 0, 0);
      scene.add(cube);
    }
}