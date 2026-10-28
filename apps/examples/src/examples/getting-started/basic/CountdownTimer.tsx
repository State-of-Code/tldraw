import { useEffect, useRef, useState } from 'react'

const DURATION_MS = 5 * 60 * 1000

export function CountdownTimer() {
	const [remainingMs, setRemainingMs] = useState(DURATION_MS)
	const [isRunning, setIsRunning] = useState(false)
	const deadline = useRef(0)

	useEffect(() => {
		if (!isRunning) return

		const interval = window.setInterval(() => {
			// A deadline keeps background-tab throttling from extending the countdown.
			const remaining = Math.max(0, deadline.current - Date.now())
			setRemainingMs(remaining)
			if (remaining === 0) setIsRunning(false)
		}, 100)

		return () => window.clearInterval(interval)
	}, [isRunning])

	function toggleTimer() {
		if (isRunning) {
			setRemainingMs(Math.max(0, deadline.current - Date.now()))
			setIsRunning(false)
		} else if (remainingMs > 0) {
			deadline.current = Date.now() + remainingMs
			setIsRunning(true)
		}
	}

	function resetTimer() {
		setIsRunning(false)
		setRemainingMs(DURATION_MS)
	}

	const totalSeconds = Math.ceil(remainingMs / 1000)
	const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
	const seconds = String(totalSeconds % 60).padStart(2, '0')
	const isFinished = remainingMs === 0
	const action = isFinished
		? 'Finished'
		: isRunning
			? 'Pause'
			: remainingMs === DURATION_MS
				? 'Start'
				: 'Resume'

	return (
		<div
			role="group"
			aria-label="Five-minute countdown"
			style={{
				display: 'flex',
				alignItems: 'center',
				flexWrap: 'wrap',
				gap: 6,
				maxWidth: 230,
				padding: 6,
				borderRadius: 8,
				background: 'var(--color-panel)',
				color: 'var(--color-text-1)',
				fontFamily: 'inherit',
				fontSize: 12,
				pointerEvents: 'auto',
			}}
		>
			<span
				role="timer"
				aria-label="Time remaining"
				aria-live="off"
				style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}
			>
				{minutes}:{seconds}
			</span>
			<button
				type="button"
				onClick={toggleTimer}
				disabled={isFinished}
				aria-label={`${action} countdown`}
				style={{ color: 'inherit', background: 'var(--color-muted-2)', borderRadius: 4 }}
			>
				{action}
			</button>
			<button
				type="button"
				onClick={resetTimer}
				aria-label="Reset countdown"
				style={{ color: 'inherit', background: 'var(--color-muted-2)', borderRadius: 4 }}
			>
				Reset
			</button>
			<span role="status">{isFinished ? 'Time is up' : ''}</span>
		</div>
	)
}
