// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // これで 0.0.0.0（全インターフェイス）をリッスン
    port: 5173,   // もし別ポートにしたい場合はここを変更
  },
});
