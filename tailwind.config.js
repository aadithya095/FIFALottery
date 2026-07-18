/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        argentina: { light: '#74ACDF', DEFAULT: '#74ACDF', dark: '#5A9AC8' },
        spain: { red: '#AA151B', yellow: '#F1BF00' },
        wc: {
          gold: '#C9A84C',
          dark: '#07071A',
          card: '#0F0F2A',
          border: '#1E1E40',
          blue: '#003087',
          red: '#BF0D3E',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'gold-shine': 'linear-gradient(105deg, #B8860B 0%, #FFD700 40%, #DAA520 55%, #C9A84C 100%)',
        'silver-scratch': 'linear-gradient(135deg, #9E9E9E 0%, #E0E0E0 30%, #BDBDBD 50%, #F5F5F5 65%, #9E9E9E 100%)',
        'hero-gradient': 'radial-gradient(ellipse at 20% 50%, #003087 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, #BF0D3E 0%, transparent 60%), linear-gradient(180deg, #07071A 0%, #0A0A2A 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite reverse',
        'spin-slow': 'spin 20s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shine-move': 'shineMove 2.5s linear infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
        'orb-drift': 'orbDrift 12s ease-in-out infinite',
        'flicker': 'flicker 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 24px rgba(201,168,76,0.5), 0 0 48px rgba(201,168,76,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(255,215,0,0.9), 0 0 80px rgba(201,168,76,0.5)' },
        },
        shineMove: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        orbDrift: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(30px,-20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px,15px) scale(0.95)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'gold-glow': '0 0 30px rgba(201,168,76,0.6), 0 0 60px rgba(201,168,76,0.3)',
        'blue-glow': '0 0 30px rgba(0,48,135,0.6)',
        'red-glow': '0 0 30px rgba(191,13,62,0.6)',
      },
    },
  },
  plugins: [],
}
