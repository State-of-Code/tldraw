import { useEditor, useValue } from 'tldraw'

export function ShapeCountBadge() {
	const editor = useEditor()
	const shapeCount = useValue('page shape count', () => editor.getCurrentPageShapeIds().size, [
		editor,
	])
	const selectedCount = useValue(
		'selected shape count',
		() => editor.getSelectedShapeIds().length,
		[editor]
	)

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 8,
				padding: '6px 10px',
				border: '1px solid var(--tl-color-divider)',
				borderRadius: 8,
				background: 'var(--tl-color-panel)',
				color: 'var(--tl-color-text-1)',
				boxShadow: 'var(--tl-shadow-1)',
				fontSize: 12,
				fontVariantNumeric: 'tabular-nums',
				whiteSpace: 'nowrap',
				pointerEvents: 'none',
			}}
		>
			<span>
				{shapeCount} {shapeCount === 1 ? 'shape' : 'shapes'}
			</span>
			<span aria-hidden="true" style={{ color: 'var(--tl-color-text-3)' }}>
				·
			</span>
			<span>{selectedCount} selected</span>
		</div>
	)
}
