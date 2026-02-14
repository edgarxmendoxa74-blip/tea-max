/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teamax: {
          primary: '#000000',      // Pure Black
          secondary: '#334155',    // Darker Gray (Slate 700)
          accent: '#000000',       // Black Accent
          dark: '#ffffff',         // Pure White (Main Background)
          surface: '#f8fafc',      // Off-White (Cards)
          border: '#e2e8f0',       // Light Border (Slate 200)
          light: '#f1f5f9',        // Lighter gray (Slate 100)
          gold: '#000000',         // Secondary Accent
          warm: '#ffffff'          // Backup White
        }
      },
      fontFamily: {
        'serif': ['Montserrat', 'system-ui', 'sans-serif'],
        'sans': ['Montserrat', 'system-ui', 'sans-serif']
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