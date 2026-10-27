import { useEffect, useRef, useState } from 'react'
import './session-timer.css'

const SESSION_DURATION_MS = 5 * 60 * 1000

export function SessionTimer() {
	const [remainingMs, setRemainingMs] = useState(SESSION_DURATION_MS)
	const [isRunning, setIsRunning] = useState(false)
	const deadlineRef = useRef<number | null>(null)
	const isFinished = remainingMs === 0
	const seconds = Math.ceil(remainingMs / 1000)
	const time = `${Math.floor(seconds / 60)
		.toString()
		.padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`

	useEffect(() => {
		if (!isRunning) return

		const update = () => {
			if (deadlineRef.current === null) return
			const remaining = Math.max(0, deadlineRef.current - Date.now())
			setRemainingMs(remaining)
			if (remaining === 0) {
				deadlineRef.current = null
				setIsRunning(false)
			}
		}

		// Recalculate from the deadline after background-tab throttling, rather than losing seconds.
		const interval = window.setInterval(update, 100)
		document.addEventListener('visibilitychange', update)
		window.addEventListener('focus', update)
		return () => {
			window.clearInterval(interval)
			document.removeEventListener('visibilitychange', update)
			window.removeEventListener('focus', update)
		}
	}, [isRunning])

	function toggleRunning() {
		if (isRunning) {
			setRemainingMs(Math.max(0, (deadlineRef.current ?? Date.now()) - Date.now()))
			deadlineRef.current = null
			setIsRunning(false)
		} else if (!isFinished) {
			deadlineRef.current = Date.now() + remainingMs
			setIsRunning(true)
		}
	}

	function reset() {
		deadlineRef.current = null
		setIsRunning(false)
		setRemainingMs(SESSION_DURATION_MS)
	}

	const action = isRunning ? 'Pause' : remainingMs === SESSION_DURATION_MS ? 'Start' : 'Resume'

	return (
		<div
			className="session-timer"
			role="group"
			aria-label="Five-minute brainstorming session"
			data-finished={isFinished}
		>
			<span
				className="session-timer__time"
				role="timer"
				aria-label="Session time remaining"
				aria-live="off"
			>
				{time}
			</span>
			<button
				className="session-timer__button"
				type="button"
				onClick={toggleRunning}
				disabled={isFinished}
				aria-label={`${action} session timer`}
			>
				{action}
			</button>
			<button
				className="session-timer__button"
				type="button"
				onClick={reset}
				aria-label="Reset session timer"
			>
				Reset
			</button>
			<span className="session-timer__status" role="status" aria-atomic="true">
				{isFinished ? 'Time’s up' : ''}
			</span>
		</div>
	)
}
