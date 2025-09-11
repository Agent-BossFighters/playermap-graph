import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'PlayermapGraph',
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'aframe', '3d-force-graph-vr'],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'aframe': 'AFRAME',
          '3d-force-graph-vr': 'ForceGraphVR'
        }
      }
    }
  }
})
