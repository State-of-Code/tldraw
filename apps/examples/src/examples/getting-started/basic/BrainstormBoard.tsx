import {
	Box,
	Editor,
	TLShapePartial,
	TldrawUiButton,
	TldrawUiButtonLabel,
	createShapeId,
	toRichText,
	useEditor,
} from 'tldraw'

const COLUMN_WIDTH = 320
const COLUMN_GAP = 32
const BOARD_WIDTH = COLUMN_WIDTH * 3 + COLUMN_GAP * 2
const BOARD_HEIGHT = 900
const BOARD_GAP = 96
const columns = [
	{ title: 'Ideas', color: 'yellow' },
	{ title: 'In Progress', color: 'light-blue' },
	{ title: 'Done', color: 'light-green' },
] as const

export function insertBrainstormBoard(editor: Editor) {
	const center = editor.getViewportPageBounds().center
	const bounds = new Box(
		center.x - BOARD_WIDTH / 2,
		center.y - BOARD_HEIGHT / 2,
		BOARD_WIDTH,
		BOARD_HEIGHT
	)
	const pageBounds = editor.getCurrentPageBounds()
	const overlapsContent = editor.getCurrentPageShapes().some((shape) => {
		const shapeBounds = editor.getShapePageBounds(shape)
		return shapeBounds && Box.Collides(bounds.clone().expandBy(BOARD_GAP), shapeBounds)
	})

	if (overlapsContent && pageBounds) {
		bounds.x = pageBounds.maxX + BOARD_GAP
	}

	// Explicit page parents keep notes independent even when a frame is selected.
	const parentId = editor.getCurrentPageId()
	const shapes: TLShapePartial[] = [
		{
			id: createShapeId(),
			type: 'text',
			parentId,
			x: bounds.x,
			y: bounds.y,
			props: {
				richText: toRichText('Brainstorming board'),
				font: 'sans',
				size: 'xl',
				color: 'black',
				w: BOARD_WIDTH,
				autoSize: false,
			},
		},
	]

	for (const [columnIndex, column] of columns.entries()) {
		const x = bounds.x + columnIndex * (COLUMN_WIDTH + COLUMN_GAP)

		shapes.push(
			{
				id: createShapeId(),
				type: 'geo',
				parentId,
				x,
				y: bounds.y + 80,
				isLocked: true,
				props: {
					geo: 'rectangle',
					w: COLUMN_WIDTH,
					h: BOARD_HEIGHT - 80,
					color: 'grey',
					fill: 'semi',
					dash: 'solid',
					size: 's',
				},
			},
			{
				id: createShapeId(),
				type: 'text',
				parentId,
				x: x + 24,
				y: bounds.y + 104,
				props: {
					richText: toRichText(column.title),
					font: 'sans',
					size: 'l',
					color: 'black',
					w: COLUMN_WIDTH - 48,
					autoSize: false,
					textAlign: 'middle',
				},
			}
		)

		for (let row = 0; row < 3; row++) {
			shapes.push({
				id: createShapeId(),
				type: 'note',
				parentId,
				x: x + (COLUMN_WIDTH - 200) / 2,
				y: bounds.y + 176 + row * 232,
				isLocked: false,
				props: {
					richText: toRichText(''),
					color: column.color,
					font: 'sans',
					size: 'm',
					scale: 1,
				},
			})
		}
	}

	editor.markHistoryStoppingPoint('insert brainstorming board')
	editor.run(() => {
		editor.createShapes(shapes)
		editor.setCurrentTool('select')
		editor.selectNone()
	})
	editor.zoomToBounds(bounds, { inset: 48, animation: { duration: 200 } })

	return shapes.map((shape) => shape.id!)
}

export function BrainstormBoardButton() {
	const editor = useEditor()

	return (
		<TldrawUiButton type="normal" onClick={() => insertBrainstormBoard(editor)}>
			<TldrawUiButtonLabel>Insert brainstorming board</TldrawUiButtonLabel>
		</TldrawUiButton>
	)
}
