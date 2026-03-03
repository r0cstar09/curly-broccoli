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
				'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
				'fade-in': 'fade-in 0.5s ease-out forwards',
			},
			keyframes: {
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(12px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
			},
			boxShadow: {
				'glow':
					'0 25px 50px -12px rgb(0 0 0 / 0.25), 0 0 20px -5px rgb(139 92 246 / 0.35)',
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
