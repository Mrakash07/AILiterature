import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Shadcn tokens */
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        /* Modern Stripe/Linear SaaS Palette */
        saas: {
          background: '#0B0B0F',
          card: '#16161D',
          border: '#2A2A35',
          textMain: '#F8F8F8',
          textMuted: '#A1A1AA',
          primary: '#9333EA',
          primaryHover: '#A855F7',
          primaryLight: '#C084FC',
        },
        saasBlue: {
          gradientStart: '#0F4C81',
          gradientMid: '#1E6FB5',
          gradientEnd: '#4F8FCC',
          accent: '#1B5FA7',
          secondary: '#2C6AA6',
          lightBg: '#F3F7FC',
          textMain: '#1F2937',
          textMuted: '#6B7C93',
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'saas-glow': '0 0 30px rgba(147, 51, 234, 0.3)',
        'saas-card': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'soft': '0 10px 40px -10px #E6EEF6',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 15px rgba(147, 51, 234, 0.2)' },
          '50%': { boxShadow: '0 0 35px rgba(147, 51, 234, 0.5)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
