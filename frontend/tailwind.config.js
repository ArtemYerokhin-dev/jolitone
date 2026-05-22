/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nude: {
          50:  '#FAF8F5',
          100: '#F4EFE8',
          200: '#E8DECE',
          300: '#D6C5AE',
          400: '#C4A882',
          500: '#B08D62',
          600: '#8E6E47',
          700: '#6B5235',
        },
        brand: {
          black: '#1A1917',
          gray:  '#6B6560',
          light: '#9E9890',
        },
      },
      fontWeight: {
        light: '350',
        normal: '420',
      },
      fontFamily: {
        serif:     ['DM Sans', 'system-ui', 'sans-serif'],
        sans:      ['DM Sans', 'system-ui', 'sans-serif'],
        cormorant: ['Cormorant Garamond', 'Georgia', 'serif'],
        playfair:  ['Playfair Display', 'Georgia', 'serif'],
        ntype:     ['NType82', 'Georgia', 'serif'],
        baskerville: ['Libre Baskerville', 'Times New Roman', 'Georgia', 'serif'],
        garamond:    ['EB Garamond', 'Garamond', 'Georgia', 'serif'],
        spectral:    ['Spectral', 'Georgia', 'serif'],
        bodoni:      ['Bodoni Moda', 'Didot', 'Georgia', 'serif'],
        italiana:    ['Italiana', 'Georgia', 'serif'],
        antiqua:     ['UniversalAntiqua', 'Italiana', 'Georgia', 'serif'],
      },
      screens: {
        xs: '480px',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-33.333%)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 18s linear infinite',
        'fade-up':        'fadeUp 0.8s ease forwards',
        'fade-up-delay':  'fadeUp 0.8s ease 0.25s forwards',
        'fade-up-delay2': 'fadeUp 0.8s ease 0.5s forwards',
      },
    },
  },
  plugins: [],
}
