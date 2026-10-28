import { Box, createShapeId, Editor, TLShapePartial, TldrawUiButton, useEditor } from 'tldraw'

const columns = [
	{ name: 'Ideas', color: 'yellow' },
	{ name: 'In Progress', color: 'light-blue' },
	{ name: 'Done', color: 'light-green' },
] as const

const columnWidth = 280
const columnHeight = 740
const columnGap = 32
const boardWidth = columns.length * columnWidth + (columns.length - 1) * columnGap

export function insertBrainstormingBoard(editor: Editor) {
	const center = editor.getViewportPageBounds().center
	const bounds = new Box(
		center.x - boardWidth / 2,
		center.y - columnHeight / 2,
		boardWidth,
		columnHeight
	)
	const occupiedBounds = editor
		.getCurrentPageShapes()
		.map((shape) => editor.getShapePageBounds(shape))
		.filter((box): box is Box => !!box)

	// Moving past each collision also leaves room for frame labels above the board.
	let collision
	while ((collision = occupiedBounds.find((box) => bounds.clone().expandBy(48).collides(box)))) {
		bounds.x = collision.maxX + 64
	}

	const shapes: TLShapePartial[] = []
	for (const [columnIndex, column] of columns.entries()) {
		const frameId = createShapeId()
		shapes.push({
			id: frameId,
			type: 'frame',
			parentId: editor.getCurrentPageId(),
			x: bounds.x + columnIndex * (columnWidth + columnGap),
			y: bounds.y,
			props: { w: columnWidth, h: columnHeight, name: column.name },
		})
		for (let row = 0; row < 3; row++) {
			shapes.push({
				id: createShapeId(),
				type: 'note',
				parentId: frameId,
				x: 40,
				y: 32 + row * 232,
				props: { color: column.color, size: 'm', font: 'sans' },
			})
		}
	}

	editor.complete()
	editor.markHistoryStoppingPoint('insert brainstorming board')
	editor.run(() => {
		editor.setCurrentTool('select')
		editor.createShapes(shapes)
		editor.selectNone()
	})
	editor.markHistoryStoppingPoint('brainstorming board inserted')
	editor.zoomToBounds(bounds, { inset: 64, animation: { duration: 250 } })
	editor.focus()
}

export function BrainstormingBoardButton() {
	const editor = useEditor()
	return (
		<TldrawUiButton
			type="normal"
			onClick={() => insertBrainstormingBoard(editor)}
			style={{
				pointerEvents: 'auto',
				background: 'var(--tl-color-panel)',
				color: 'var(--tl-color-text-1)',
				border: '1px solid var(--tl-color-divider)',
				borderRadius: 8,
				padding: '6px 10px',
				height: 'auto',
				minHeight: 32,
				maxWidth: '100%',
				whiteSpace: 'normal',
			}}
		>
			Insert brainstorming board
		</TldrawUiButton>
	)
}
