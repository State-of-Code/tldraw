import { DefaultSharePanel, TLComponents, Tldraw, track, useEditor } from 'tldraw'
import 'tldraw/tldraw.css'
import { BrainstormBoardButton } from './BrainstormBoardButton'

const components = { TopPanel: BrainstormBoardButton }

const ShapeCountPanel = track(function ShapeCountPanel() {
	const editor = useEditor()
	const shapeCount = editor.getCurrentPageShapeIds().size
	const selectedCount = editor.getSelectedShapeIds().length

	return (
		<>
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
					marginBottom: 8,
					pointerEvents: 'none',
					whiteSpace: 'nowrap',
				}}
			>
				<strong>{shapeCount}</strong> {shapeCount === 1 ? 'shape' : 'shapes'}
				{' · '}
				<strong>{selectedCount}</strong> selected
			</div>
			<DefaultSharePanel />
		</>
	)
})

const components: TLComponents = {
	SharePanel: ShapeCountPanel,
}

export default function BasicExample() {
	return (
		<div className="tldraw__editor">
			<Tldraw components={components} />
		</div>
	)
}
