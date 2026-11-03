import { CSSProperties, useCallback, useEffect, useState } from 'react'
import { Editor, useEditor } from 'tldraw'

const DURATION_MS = 5 * 60 * 1000
interface TimerState {
	remainingMs: number
	deadline: number | null
}

// Focus mode unmounts SharePanel; keep its timer for the lifetime of this editor only.
const timers = new WeakMap<Editor, TimerState>()

function getTimer(editor: Editor): TimerState {
	const timer = timers.get(editor) ?? { remainingMs: DURATION_MS, deadline: null }
	if (timer.deadline === null) return timer
	const remainingMs = Math.max(0, timer.deadline - Date.now())
	return { remainingMs, deadline: remainingMs === 0 ? null : timer.deadline }
}

const buttonStyle: CSSProperties = {
	color: 'inherit',
	background: 'var(--tl-color-muted-2)',
	border: '1px solid var(--tl-color-divider)',
	borderRadius: 4,
	padding: '4px 8px',
	minHeight: 28,
	font: 'inherit',
}

export function CountdownTimer() {
	const editor = useEditor()
	const [timer, setTimer] = useState(() => getTimer(editor))
	const { remainingMs, deadline } = timer
	const isRunning = deadline !== null
	const updateTimer = useCallback(
		(next: TimerState) => {
			timers.set(editor, next)
			setTimer(next)
		},
		[editor]
	)

	useEffect(() => {
		if (deadline === null) return

		const interval = window.setInterval(() => {
			// A deadline keeps background-tab throttling from extending the countdown.
			const remainingMs = Math.max(0, deadline - Date.now())
			updateTimer({ remainingMs, deadline: remainingMs === 0 ? null : deadline })
		}, 100)

		return () => window.clearInterval(interval)
	}, [deadline, updateTimer])

	function toggleTimer() {
		if (deadline !== null) {
			updateTimer({ remainingMs: Math.max(0, deadline - Date.now()), deadline: null })
		} else if (remainingMs > 0) {
			updateTimer({ remainingMs, deadline: Date.now() + remainingMs })
		}
	}

	function resetTimer() {
		updateTimer({ remainingMs: DURATION_MS, deadline: null })
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
				background: 'var(--tl-color-panel)',
				color: 'var(--tl-color-text-1)',
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
				style={buttonStyle}
			>
				{action}
			</button>
			<button type="button" onClick={resetTimer} aria-label="Reset countdown" style={buttonStyle}>
				Reset
			</button>
			<span role="status">{isFinished ? 'Time is up' : ''}</span>
		</div>
	)
}
