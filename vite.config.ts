import glsl from 'vite-plugin-glsl';
import path from 'path';
import {resolve} from "node:dns";

export default {
    server: {
        host: '0.0.0.0',
        port: 4000,
    },
    plugins: [glsl()],
    root: '.',
    assetsInclude: ['**/*.glb', '**/*.fbx', '**/*.csv'],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        },
    },
    build: {
        rollupOptions: {}
    },
    base: './',
}
