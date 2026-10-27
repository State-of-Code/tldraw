import { DefaultSharePanel, TLComponents, Tldraw, track, useEditor } from 'tldraw'
import 'tldraw/tldraw.css'
import { BrainstormBoardButton } from './BrainstormBoardButton'
import { CountdownProvider, CountdownTimer } from './CountdownTimer'

const ShapeCountPanel = track(function ShapeCountPanel() {
	const editor = useEditor()
	const shapeCount = editor.getCurrentPageShapeIds().size
	const selectedCount = editor.getSelectedShapeIds().length
	const isCompact = editor.getViewportScreenBounds().width < 600

	return (
		<>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-end',
					gap: 8,
					marginBottom: 8,
					...(isCompact
						? ({ position: 'absolute', top: 56, right: 8, maxWidth: 'calc(100% - 16px)' } as const)
						: {}),
				}}
			>
				<div
					role="status"
					aria-label={`${shapeCount} shapes on canvas, ${selectedCount} selected`}
					style={{
						background: 'var(--tl-color-panel)',
						color: 'var(--tl-color-text)',
						borderRadius: 'var(--tl-radius-2)',
						boxShadow: 'var(--tl-shadow-1)',
						fontSize: 12,
						fontVariantNumeric: 'tabular-nums',
						padding: '6px 10px',
						pointerEvents: 'none',
						whiteSpace: 'nowrap',
					}}
				>
					<strong>{shapeCount}</strong> {shapeCount === 1 ? 'shape' : 'shapes'}
					{' · '}
					<strong>{selectedCount}</strong> selected
				</div>
				<CountdownTimer />
			</div>
			<DefaultSharePanel />
		</>
	)
})

const components: TLComponents = {
	TopPanel: BrainstormBoardButton,
	SharePanel: ShapeCountPanel,
}

export default function BasicExample() {
	return (
		<div className="tldraw__editor">
			<CountdownProvider>
				<Tldraw components={components} />
			</CountdownProvider>
		</div>
	)
}
