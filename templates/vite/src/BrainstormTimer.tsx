import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

const FIVE_MINUTES_MS = 5 * 60 * 1000
const buttonStyle: CSSProperties = {
  appearance: 'none', border: '1px solid var(--tl-color-divider, #d8dce1)',
  borderRadius: 6, background: 'var(--tl-color-panel, #fff)', color: 'inherit',
  padding: '5px 9px', font: 'inherit', cursor: 'pointer',
}

const TimerContext = createContext<ReturnType<typeof useBrainstormTimer> | null>(null)

function useBrainstormTimer() {
  const [remainingMs, setRemainingMs] = useState(FIVE_MINUTES_MS)
  const [isRunning, setIsRunning] = useState(false)
  const deadlineRef = useRef<number | null>(null)
  const remainingRef = useRef(FIVE_MINUTES_MS)

  useEffect(() => {
    if (!isRunning) return
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

export function BrainstormTimerProvider({ children }: { children: ReactNode }) {
  const timer = useBrainstormTimer()
  return <TimerContext.Provider value={timer}>{children}</TimerContext.Provider>
}

export function BrainstormTimer() {
  const timer = useContext(TimerContext)
  if (!timer) throw new Error('BrainstormTimer requires BrainstormTimerProvider')
  const { remainingMs, isRunning, start, pause, reset } = timer
  const seconds = Math.ceil(remainingMs / 1000)
  const minutesPart = Math.floor(seconds / 60)
  const secondsPart = seconds % 60
  const time = `${minutesPart}:${String(secondsPart).padStart(2, '0')}`
  const isFinished = remainingMs === 0
  const state = isFinished ? "Time's up!" : isRunning ? 'Running' : remainingMs < FIVE_MINUTES_MS ? 'Paused' : '5-minute brainstorm'

  return (
    <div role="group" aria-label="Brainstorm timer"
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8,
        padding: '7px 10px', border: '1px solid var(--tl-color-divider, #d8dce1)',
        borderRadius: 9, background: 'var(--tl-color-panel, #fff)',
        color: 'var(--tl-color-text-1, #222)', fontFamily: 'inherit',
        fontSize: 12, pointerEvents: 'all' }}>
      <span role="timer" aria-live="off" aria-label={`${minutesPart} minutes ${secondsPart} seconds remaining`}
        style={{ fontSize: 18, fontWeight: 650, fontVariantNumeric: 'tabular-nums' }}>{time}</span>
      <span style={{ minWidth: 58, fontWeight: isFinished ? 650 : 400 }}>{state}</span>
      <button type="button" onClick={isRunning ? pause : start} disabled={isFinished}
        aria-label={isRunning ? 'Pause brainstorm timer' : 'Start brainstorm timer'}
        style={{ ...buttonStyle, cursor: isFinished ? 'default' : 'pointer', opacity: isFinished ? 0.5 : 1 }}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <button type="button" onClick={reset} aria-label="Reset brainstorm timer to five minutes" style={buttonStyle}>Reset</button>
      <span role="status" aria-live="polite" aria-atomic="true"
        style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
          overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0 }}>
        {isFinished ? "Time's up! Your five-minute brainstorm has ended." : ''}
      </span>
    </div>
  )
}

export default BrainstormTimer
