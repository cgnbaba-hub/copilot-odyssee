/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        sans: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        // Main palette
        'bg-dark':    '#1A1A2E',
        'bg-darker':  '#0D0D1A',
        'accent-red': '#E94560',
        'accent-blue':'#0F3460',
        'accent-teal':'#16213E',
        // Islands
        'aurora': {
          DEFAULT: '#7B68EE',
          light:   '#E0E0FF',
          dark:    '#4B3AA3',
        },
        'gridforge': {
          DEFAULT: '#FF6B35',
          light:   '#FFB347',
          dark:    '#4A4A4A',
        },
        'deckstorm': {
          DEFAULT: '#FF1493',
          light:   '#FFD700',
          dark:    '#8B0057',
        },
        // Game
        'xp-green':   '#00FF00',
        'xp-gold':    '#FFD700',
        'hp-red':     '#FF4444',
        // UI
        'pixel-border': '#FFFFFF',
        'pixel-shadow': '#000000',
      },
      spacing: {
        'px2': '2px',
        'px4': '4px',
      },
      boxShadow: {
        'pixel':    '4px 4px 0px #000000',
        'pixel-sm': '2px 2px 0px #000000',
        'pixel-lg': '6px 6px 0px #000000',
        'pixel-inset': 'inset 2px 2px 0px #000000',
        'glow-purple': '0 0 20px rgba(123, 104, 238, 0.6)',
        'glow-orange': '0 0 20px rgba(255, 107, 53, 0.6)',
        'glow-pink':   '0 0 20px rgba(255, 20, 147, 0.6)',
        'glow-green':  '0 0 20px rgba(0, 255, 0, 0.6)',
      },
      borderWidth: {
        '3': '3px',
      },
      animation: {
        'pixel-blink': 'blink 1s step-end infinite',
        'float':        'float 3s ease-in-out infinite',
        'xp-rise':      'xpRise 1s ease-out forwards',
        'shake':        'shake 0.3s ease-in-out',
        'typewriter':   'typewriter 2s steps(40) forwards',
        'scanline':     'scanline 8s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        xpRise: {
          '0%':   { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-60px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%':       { transform: 'translateX(-4px)' },
          '75%':       { transform: 'translateX(4px)' },
        },
        typewriter: {
          from: { width: '0' },
          to:   { width: '100%' },
        },
        scanline: {
          '0%':   { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' },
        },
      },
    },
  },
  plugins: [],
}
