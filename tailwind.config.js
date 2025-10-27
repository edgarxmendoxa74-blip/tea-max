/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        natalna: {
          primary: '#2D7A4F',      // Forest green - main brand color
          secondary: '#4A9D6F',    // Medium green - accent
          accent: '#6BBF8F',       // Mint green - highlights
          dark: '#1B4332',         // Deep forest - text
          cream: '#F1F8F5',        // Mint cream - background
          beige: '#E8F5ED',        // Soft mint - cards
          gold: '#85C9A0',         // Light sage - premium touches
          sage: '#52B788',         // Fresh sage - natural accent
          terracotta: '#74C69D',   // Seafoam green
          wood: '#1E5C3A'          // Rich emerald tone
        }
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Lato', 'Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
};