/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        moss: {
          50: '#f3f6ed',
          100: '#e3ebd4',
          200: '#c9d9ad',
          300: '#a8c179',
          400: '#87a854',
          500: '#6b8c3c',
          600: '#516b2d',
          700: '#3f5325',
          800: '#34431f',
          900: '#2c391c',
          950: '#161e0d'
        },
        clay: {
          50: '#fbf6f1',
          100: '#f5e9dd',
          200: '#e9cdb0',
          300: '#dba97c',
          400: '#cd8650',
          500: '#bc6d36',
          600: '#a1572b',
          700: '#824327',
          800: '#6a3825',
          900: '#583021',
          950: '#2f1710'
        },
        ink: {
          50: '#f6f6f4',
          100: '#e8e7e1',
          200: '#d1cfc3',
          300: '#aeaa98',
          400: '#8a846d',
          500: '#6f6856',
          600: '#5a5444',
          700: '#494438',
          800: '#3d3930',
          900: '#211f1a',
          950: '#15130f'
        },
        bloom: '#d6577a',
        sun: '#e0a72e'
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      borderRadius: {
        organic: '2rem 0.5rem 2rem 0.5rem'
      },
      keyframes: {
        sprout: {
          '0%': { transform: 'scale(0.3) translateY(8px)', opacity: '0' },
          '60%': { transform: 'scale(1.08) translateY(-2px)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' }
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-1.5deg)' },
          '50%': { transform: 'rotate(1.5deg)' }
        },
        rise: {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        sprout: 'sprout 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        sway: 'sway 4s ease-in-out infinite',
        rise: 'rise 0.4s ease-out'
      }
    },
  },
  plugins: [],
}
