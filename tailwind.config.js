/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teamax: {
          primary: '#1e293b',      // Blueprint Dark (Slate 800)
          secondary: '#64748b',    // Blueprint Gray Soft (Slate 500)
          accent: '#1e40af',       // Blueprint Blue (Blue 800)
          dark: '#fefefe',         // Blueprint Off-White (Main Background)
          surface: '#f8fafc',      // Blueprint Cream (Light Cards/Header)
          border: '#cbd5e1',       // Blueprint Border (Slate 300)
          light: '#e2e8f0',        // Lighter elements (Slate 200)
          gold: '#3b82f6',         // Secondary Accent (Blue 500)
          warm: '#f1f5f9'          // Secondary Background (Slate 100)
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