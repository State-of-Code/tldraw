/// <reference types="vitest/globals" />
import { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { CountdownTimer } from './CountdownTimer'

let container: HTMLDivElement
let root: Root

function click(label: string) {
	const button = container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
	if (!button) throw new Error(`Missing button: ${label}`)
	act(() => button.click())
}

function time() {
	return container.querySelector('[role="timer"]')?.textContent
}

beforeEach(() => {
	vi.useFakeTimers()
	vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	container = document.createElement('div')
	document.body.append(container)
	root = createRoot(container)
	act(() => root.render(<CountdownTimer />))
})

afterEach(() => {
	act(() => root.unmount())
	container.remove()
	vi.useRealTimers()
	vi.unstubAllGlobals()
})

describe('CountdownTimer', () => {
	it('starts paused at five minutes and resumes from the exact paused remainder', () => {
		expect(time()).toBe('05:00')
		act(() => vi.advanceTimersByTime(10_000))
		expect(time()).toBe('05:00')
		click('Start countdown')
		act(() => vi.advanceTimersByTime(1_250))
		click('Pause countdown')
		expect(time()).toBe('04:59')
		act(() => vi.advanceTimersByTime(10_000))
		expect(time()).toBe('04:59')
		click('Resume countdown')
		act(() => vi.advanceTimersByTime(800))
		expect(time()).toBe('04:58')
	})

	it('uses the deadline after delayed updates and stops at zero', () => {
		click('Start countdown')
		act(() => {
			vi.setSystemTime(new Date('2026-01-01T00:05:10Z'))
			vi.advanceTimersByTime(100)
		})
		expect(time()).toBe('00:00')
		expect(container.querySelector('[role="status"]')?.textContent).toBe('Time is up')
		expect(container.querySelector('button')?.disabled).toBe(true)
		expect(vi.getTimerCount()).toBe(0)
		act(() => vi.advanceTimersByTime(10_000))
		expect(time()).toBe('00:00')
		click('Reset countdown')
		expect(time()).toBe('05:00')
		expect(container.querySelector('[role="status"]')?.textContent).toBe('')
	})

	it('resets a running or paused countdown to five minutes paused', () => {
		click('Start countdown')
		act(() => vi.advanceTimersByTime(12_000))
		click('Reset countdown')
		expect(time()).toBe('05:00')
		expect(vi.getTimerCount()).toBe(0)
		act(() => vi.advanceTimersByTime(10_000))
		expect(time()).toBe('05:00')
		click('Start countdown')
		act(() => vi.advanceTimersByTime(1_000))
		click('Pause countdown')
		click('Reset countdown')
		expect(time()).toBe('05:00')
		expect(container.querySelector('button')?.textContent).toBe('Start')
	})

	it('cleans up its interval on unmount without announcing each tick', () => {
		click('Start countdown')
		expect(vi.getTimerCount()).toBe(1)
		expect(container.querySelector('[role="timer"]')?.getAttribute('aria-live')).toBe('off')
		expect(container.querySelector('[role="status"]')?.textContent).toBe('')
		act(() => root.unmount())
		expect(vi.getTimerCount()).toBe(0)
		root = createRoot(container)
	})
})
