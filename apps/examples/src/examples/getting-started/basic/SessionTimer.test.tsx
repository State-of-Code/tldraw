/// <reference types="vitest/globals" />
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { SessionTimer } from './SessionTimer'

describe('SessionTimer', () => {
	let container: HTMLDivElement
	let root: Root

	beforeEach(async () => {
		vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
		container = document.createElement('div')
		document.body.appendChild(container)
		root = createRoot(container)
		await act(async () => root.render(<SessionTimer />))
	})

	afterEach(async () => {
		await act(async () => root.unmount())
		container.remove()
		vi.useRealTimers()
		vi.unstubAllGlobals()
	})

	function time() {
		return container.querySelector('[role="timer"]')?.textContent
	}

	async function click(label: string) {
		const button = container.querySelector<HTMLButtonElement>(
			`[aria-label="${label} session timer"]`
		)
		expect(button).not.toBeNull()
		await act(async () => button!.click())
	}

	async function advance(ms: number) {
		await act(async () => vi.advanceTimersByTime(ms))
	}

	it('starts stopped at five minutes', async () => {
		expect(time()).toBe('05:00')
		await advance(60_000)
		expect(time()).toBe('05:00')
	})

	it('preserves the remaining time through pause and resume', async () => {
		await click('Start')
		await advance(30_500)
		expect(time()).toBe('04:30')
		await click('Pause')
		await advance(60_000)
		expect(time()).toBe('04:30')
		await click('Resume')
		await advance(500)
		expect(time()).toBe('04:29')
	})

	it('uses the deadline after a delayed callback and announces only expiry', async () => {
		await click('Start')
		expect(container.querySelector('[role="status"]')?.textContent).toBe('')
		vi.setSystemTime(new Date('2026-01-01T00:06:00Z'))
		await advance(100)
		expect(time()).toBe('00:00')
		expect(container.querySelector('[role="status"]')?.textContent).toBe('Time’s up')
		expect(
			container.querySelector<HTMLButtonElement>('[aria-label="Resume session timer"]')?.disabled
		).toBe(true)
		expect(vi.getTimerCount()).toBe(0)
		await advance(60_000)
		expect(time()).toBe('00:00')
	})

	it('resets running, paused, and expired sessions to a stopped five minutes', async () => {
		await click('Start')
		await advance(10_000)
		await click('Reset')
		expect(time()).toBe('05:00')
		await advance(10_000)
		expect(time()).toBe('05:00')
		await click('Start')
		await advance(10_000)
		await click('Pause')
		await click('Reset')
		expect(time()).toBe('05:00')
		await click('Start')
		await advance(300_000)
		await click('Reset')
		expect(time()).toBe('05:00')
		expect(container.querySelector('[role="status"]')?.textContent).toBe('')
		expect(vi.getTimerCount()).toBe(0)
	})

	it('cleans up its running interval when unmounted', async () => {
		await click('Start')
		expect(vi.getTimerCount()).toBe(1)
		await act(async () => root.unmount())
		expect(vi.getTimerCount()).toBe(0)
		root = createRoot(container)
	})
})
