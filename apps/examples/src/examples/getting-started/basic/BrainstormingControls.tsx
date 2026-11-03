import { useRef } from 'react'
import { useEditor, useValue } from 'tldraw'
import { BrainstormingBoardButton } from './BrainstormingBoard'
import { CountdownTimer } from './CountdownTimer'
import { ShapeCountBadge } from './ShapeCountBadge'

export function BrainstormingControls() {
	const editor = useEditor()
	const controlsRef = useRef<HTMLDivElement>(null)
	const viewportWidth = useValue(
		'brainstorming toolbar width',
		() => editor.getViewportScreenBounds().width,
		[editor]
	)
	return (
		<div
			ref={controlsRef}
			aria-label="Brainstorming controls"
			style={{
				display: 'flex',
				flexWrap: 'wrap',
				alignItems: 'center',
				justifyContent: 'flex-end',
				gap: 8,
				maxWidth: Math.min(560, Math.max(200, viewportWidth - 220)),
				padding: 4,
				pointerEvents: 'auto',
			}}
		>
			<BrainstormingBoardButton
				getControlsBottom={() => controlsRef.current?.getBoundingClientRect().bottom}
			/>
			<CountdownTimer />
			<ShapeCountBadge />
		</div>
	)
}
