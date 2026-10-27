import {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type ReactNode,
} from 'react'

const FIVE_MINUTES_MS = 5 * 60 * 1000
const buttonStyle: CSSProperties = {
	appearance: 'none',
	border: '1px solid var(--tl-color-divider)',
	borderRadius: 6,
	background: 'var(--tl-color-panel)',
	color: 'inherit',
	padding: '5px 9px',
	font: 'inherit',
	cursor: 'pointer',
}

const CountdownContext = createContext<ReturnType<typeof useCountdown> | null>(null)

function useCountdown() {
	const [remainingMs, setRemainingMs] = useState(FIVE_MINUTES_MS)
	const [isRunning, setIsRunning] = useState(false)
	const deadlineRef = useRef<number | null>(null)
	const remainingRef = useRef(FIVE_MINUTES_MS)

	useEffect(() => {
		if (!isRunning) return

		// Recompute from the deadline so throttled background tabs do not lose time.
		const syncWithClock = () => {
			if (deadlineRef.current === null) return
			const remaining = Math.max(0, deadlineRef.current - Date.now())
			remainingRef.current = remaining
			setRemainingMs(remaining)
			if (remaining === 0) {
				deadlineRef.current = null
				setIsRunning(false)
			}
		}

		syncWithClock()
		const interval = window.setInterval(syncWithClock, 250)
		document.addEventListener('visibilitychange', syncWithClock)
		window.addEventListener('focus', syncWithClock)
		return () => {
			window.clearInterval(interval)
			document.removeEventListener('visibilitychange', syncWithClock)
			window.removeEventListener('focus', syncWithClock)
		}
	}, [isRunning])

	function start() {
		if (deadlineRef.current !== null || remainingRef.current <= 0) return
		deadlineRef.current = Date.now() + remainingRef.current
		setIsRunning(true)
	}

	function pause() {
		if (deadlineRef.current === null) return
		const remaining = Math.max(0, deadlineRef.current - Date.now())
		deadlineRef.current = null
		remainingRef.current = remaining
		setRemainingMs(remaining)
		setIsRunning(false)
	}

	function reset() {
		deadlineRef.current = null
		remainingRef.current = FIVE_MINUTES_MS
		setRemainingMs(FIVE_MINUTES_MS)
		setIsRunning(false)
	}

	return { remainingMs, isRunning, start, pause, reset }
}

// Keep this above Tldraw so hiding the SharePanel does not reset a running timer.
export function CountdownProvider({ children }: { children: ReactNode }) {
	const countdown = useCountdown()
	return <CountdownContext.Provider value={countdown}>{children}</CountdownContext.Provider>
}

export function CountdownTimer() {
	const countdown = useContext(CountdownContext)
	if (!countdown) throw new Error('CountdownTimer requires CountdownProvider')

	const { remainingMs, isRunning, start, pause, reset } = countdown
	const seconds = Math.ceil(remainingMs / 1000)
	const minutesPart = Math.floor(seconds / 60)
	const secondsPart = seconds % 60
	const time = `${String(minutesPart).padStart(2, '0')}:${String(secondsPart).padStart(2, '0')}`
	const isFinished = remainingMs === 0
	const status = isFinished
		? 'Time is up'
		: isRunning
			? 'Running'
			: remainingMs < FIVE_MINUTES_MS
				? 'Paused'
				: '5-minute timer'

	return (
		<div
			role="group"
			aria-label="Five-minute countdown"
			onPointerDown={(event) => event.stopPropagation()}
			onPointerUp={(event) => event.stopPropagation()}
			onClick={(event) => event.stopPropagation()}
			onKeyDown={(event) => event.stopPropagation()}
			onKeyUp={(event) => event.stopPropagation()}
			style={{
				display: 'flex',
				alignItems: 'center',
				flexWrap: 'wrap',
				gap: 8,
				padding: '7px 10px',
				border: '1px solid var(--tl-color-divider)',
				borderRadius: 9,
				background: 'var(--tl-color-panel)',
				color: 'var(--tl-color-text-1)',
				fontFamily: 'inherit',
				fontSize: 12,
				pointerEvents: 'all',
			}}
		>
			<span
				role="timer"
				aria-live="off"
				aria-label={`${minutesPart} minutes ${secondsPart} seconds remaining`}
				style={{ fontSize: 18, fontWeight: 650, fontVariantNumeric: 'tabular-nums' }}
			>
				{time}
			</span>
			<span
				role="status"
				aria-live="polite"
				aria-atomic="true"
				style={{ fontWeight: isFinished ? 650 : 400 }}
			>
				{status}
			</span>
			<button
				type="button"
				onClick={isRunning ? pause : start}
				disabled={isFinished}
				aria-label={isRunning ? 'Pause countdown' : 'Start countdown'}
				title={isFinished ? 'Reset to start another five-minute countdown' : undefined}
				style={{
					...buttonStyle,
					cursor: isFinished ? 'default' : 'pointer',
					opacity: isFinished ? 0.5 : 1,
				}}
			>
				{isRunning ? 'Pause' : 'Start'}
			</button>
			<button
				type="button"
				onClick={reset}
				aria-label="Reset countdown to five minutes"
				title="Reset to 05:00 and pause"
				style={buttonStyle}
			>
				Reset
			</button>
		</div>
	)
}
