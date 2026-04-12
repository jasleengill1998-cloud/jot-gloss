import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream:    { DEFAULT: '#FFF8F9', 50: '#FFFCFD', 100: '#FFF8F9', 200: '#FFF4F6' },
        plum:     { DEFAULT: '#5A3E4B', 50: '#FFF4F6', 100: '#FFE8EF', 200: '#F0C8D0', 300: '#E8A0B0', 400: '#5A3E4B', 500: '#4A3040' },
        blue:     { DEFAULT: '#B8D0E8', 50: '#F0F5FA', 100: '#E0ECF8', 200: '#B8D0E8', 300: '#A8C8F0', 400: '#88B0D8' },
        lavender: { DEFAULT: '#D0C0E0', 50: '#F8F4FC', 100: '#EDE7F3', 200: '#D0C0E0', 300: '#C8B0E8', 400: '#B0A0D0' },
        mustard:  { DEFAULT: '#E8D8B0', 50: '#FBF8F0', 100: '#F5F0D8', 200: '#E8D8B0', 300: '#D8C890', 400: '#C8B878' },
        blush:    { DEFAULT: '#E8B8C0', 50: '#FFF4F6', 100: '#FFE8EF', 200: '#F0C8D0', 300: '#E8B8C0', 400: '#D8A0B0' },
        taupe:    { DEFAULT: '#C8B8A8', 100: '#F0EAE0', 200: '#E0D0C0', 300: '#C8B8A8', 400: '#A89888' },
        sage:     { DEFAULT: '#98C8A0', 50: '#F0F8F0', 100: '#E0F0E0', 200: '#B8D8C0', 500: '#88B898' },
        rose:     { DEFAULT: '#E8B8C0', 50: '#FFF4F6', 100: '#FFE8EF', 200: '#F0C8D0', 300: '#E8B8C0', 500: '#D0A0B0' },
        butter:   { DEFAULT: '#E8D8B0', 50: '#FBF8F0', 200: '#F5F0D8' },
        bluegrey: { DEFAULT: '#B8D0E8', 50: '#F0F5FA', 100: '#E0ECF8', 200: '#B8D0E8', 300: '#A8C0D8' },
      },
      fontFamily: {
        heading: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:    ['Outfit', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        bloom: '10px',
      },
      boxShadow: {
        bloom:    '0 1px 3px rgba(140,120,90,0.06)',
        'bloom-md': '0 4px 12px rgba(140,120,90,0.08)',
        'bloom-lg': '0 8px 24px rgba(140,120,90,0.1)',
      },
    },
  },
  plugins: [typography],
} satisfies Config
