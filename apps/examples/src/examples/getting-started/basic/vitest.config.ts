import { defineConfig } from 'vitest/config'

export default defineConfig({
	root: import.meta.dirname,
	test: {
		name: 'basic-countdown',
		globals: true,
		environment: 'jsdom',
		include: ['CountdownTimer.test.tsx'],
	},
})
