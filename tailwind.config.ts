import kobalte from '@kobalte/tailwindcss';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import colors from 'tailwindcss/colors.js';
import { fontFamily } from 'tailwindcss/defaultTheme.js';
import plugin from 'tailwindcss/plugin.js';

export default {
	content: ['./src/**/*.{astro,js,jsx,ts,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Exo 2 Variable', ...fontFamily.sans],
				display: ['Orbitron Variable', ...fontFamily.sans],
			},
			animation: {
				'fade-in-up': 'fade-in-up 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				float: 'float 6s ease-in-out infinite',
				'orbit-pulse': 'orbit-pulse 3.5s ease-in-out infinite',
				sheen: 'sheen 1.8s ease-out forwards',
			},
			keyframes: {
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(18px) scale(0.98)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				float: {
					'0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(-1deg)' },
					'50%': { transform: 'translate3d(0, -14px, 0) rotate(1deg)' },
				},
				'orbit-pulse': {
					'0%, 100%': { opacity: '0.35', transform: 'scale(0.96)' },
					'50%': { opacity: '0.8', transform: 'scale(1.04)' },
				},
				sheen: {
					'0%': { transform: 'translateX(-120%) skewX(-18deg)' },
					'100%': { transform: 'translateX(220%) skewX(-18deg)' },
				},
			},
			boxShadow: {
				glow: '0 25px 50px -12px rgb(0 0 0 / 0.25), 0 0 20px -5px rgb(139 92 246 / 0.35)',
				'astro-card':
					'0 24px 80px -36px rgb(124 58 237 / 0.85), inset 0 1px 0 rgb(255 255 255 / 0.08)',
				'astro-lift':
					'0 32px 90px -34px rgb(168 85 247 / 0.95), 0 18px 36px -24px rgb(0 0 0 / 0.95)',
			},
			colors: {
				theme: {
					base: colors.slate,
					// Astro Shop purple accent palette
					accent: {
						50: '#f5f3ff',
						100: '#ede9fe',
						200: '#ddd6fe',
						300: '#c4b5fd',
						400: '#a78bfa',
						500: '#8b5cf6',
						600: '#7c3aed',
						700: '#6d28d9',
						800: '#5b21b6',
						900: '#4c1d95',
						950: '#2e1065',
					},
				},
			},
		},
	},
	plugins: [
		animate,
		kobalte,
		typography,
		plugin(function customStyles(api) {
			api.addUtilities({
				'.grid-center': {
					display: 'grid',
					'place-items': 'center',
					'place-content': 'center',
				},
			});
		}),
	],
	corePlugins: {
		container: false,
	},
} satisfies Config;
