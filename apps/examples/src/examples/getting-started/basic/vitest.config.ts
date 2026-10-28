import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	root: fileURLToPath(new URL('.', import.meta.url)),
	plugins: [
		{
			name: 'svg-test-stub',
			transform(_code, id) {
				if (id.endsWith('.svg')) return { code: 'export default {}', map: null }
				return undefined
			},
		},
	],
	test: {
		name: 'basic-brainstorming',
		globals: true,
		environment: 'jsdom',
		pool: 'threads',
		include: ['BrainstormingBoard.test.ts', 'CountdownTimer.test.tsx'],
		setupFiles: [
			fileURLToPath(new URL('../../../../../../internal/config/vitest/setup.ts', import.meta.url)),
			fileURLToPath(new URL('../../../../../../packages/tldraw/setupVitest.js', import.meta.url)),
		],
	},
})
