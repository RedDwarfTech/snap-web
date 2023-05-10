import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        // https://stackoverflow.com/questions/68643743/separating-material-ui-in-vite-rollup-as-a-manual-chunk-to-reduce-chunk-size
        manualChunks(id){
          if (id.includes('node_modules')) {
            if(id.includes("antd")){
              return "antd-vendor";
            }else if(id.includes("react-dom")){
              return "react-dom-vendor";
            }else if(id.includes("react-router-dom")){
              return "react-router-dom-vendor";
            }else if(id.includes("redux")){
              return "redux-vendor";
            }
            return 'vendor';
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
