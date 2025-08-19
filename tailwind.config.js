// tailwind.config.js
import plugin from 'flowbite/plugin';
import { defineConfig } from 'tailwindcss';

export default defineConfig({
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
    './node_modules/flowbite/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0f1f1d',
        'brand-teal': '#2bb3a0',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [plugin,require('flowbite/plugin'),],
});
