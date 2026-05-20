import { defineConfig } from 'vite' // https://vitejs.dev/config/ 
import react from '@vitejs/plugin-react' // Import the React plugin for Vite, which enables support for React features such as JSX and Fast Refresh
import tailwindcss from '@tailwindcss/vite' // Import the Tailwind CSS plugin for Vite, which allows you to use Tailwind CSS in your project without needing to set up PostCSS separately

export default defineConfig({
  plugins: [react(), tailwindcss()],
})