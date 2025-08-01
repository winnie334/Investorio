import glsl from 'vite-plugin-glsl';
import path from 'path';

export default {
    server: {
        host: '0.0.0.0',
        port: 4000,
    },
    plugins: [glsl()],
    assetsInclude: ['**/*.glb', '**/*.fbx'],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'), // ✅ This enables @/...
        },
    },
}
