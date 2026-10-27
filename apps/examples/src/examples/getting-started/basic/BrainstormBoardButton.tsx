import {
	Box,
	Editor,
	TLFrameShape,
	TLNoteShape,
	TLShapePartial,
	TldrawUiButton,
	createShapeId,
	toRichText,
	useEditor,
	useValue,
} from 'tldraw'

const COLUMN_WIDTH = 280
const COLUMN_HEIGHT = 760
const COLUMN_GAP = 32
const BOARD_WIDTH = COLUMN_WIDTH * 3 + COLUMN_GAP * 2
const columns = [
	{ name: 'Ideas', color: 'yellow' },
	{ name: 'In progress', color: 'light-blue' },
	{ name: 'Done', color: 'light-green' },
] as const

export function insertBrainstormBoard(editor: Editor) {
	if (editor.getIsReadonly()) return

	const center = editor.getViewportPageBounds().center
	const bounds = new Box(
		center.x - BOARD_WIDTH / 2,
		center.y - COLUMN_HEIGHT / 2,
		BOARD_WIDTH,
		COLUMN_HEIGHT
	)
	const existingBounds = editor.getCurrentPageShapes().flatMap((shape) => {
		const shapeBounds = editor.getShapePageBounds(shape)
		return shapeBounds ? [shapeBounds] : []
	})

	// Search from the viewport center so repeated insertions never cover existing content.
	let collision: Box | undefined
	while ((collision = existingBounds.find((other) => bounds.collides(other)))) {
		bounds.x = collision.maxX + 64
	}

	const shapes: TLShapePartial<TLFrameShape | TLNoteShape>[] = []
	for (const [index, column] of columns.entries()) {
		const frameId = createShapeId()
		shapes.push({
			id: frameId,
			type: 'frame',
			parentId: editor.getCurrentPageId(),
			x: bounds.x + index * (COLUMN_WIDTH + COLUMN_GAP),
			y: bounds.y,
			props: { w: COLUMN_WIDTH, h: COLUMN_HEIGHT, name: column.name },
		})
		for (let row = 0; row < 3; row++) {
			shapes.push({
				id: createShapeId(),
				type: 'note',
				parentId: frameId,
				x: 40,
				y: 40 + row * 240,
				props: { color: column.color, richText: toRichText('') },
			})
		}
	}

	editor.markHistoryStoppingPoint('before brainstorming board')
	editor.run(() => editor.createShapes(shapes))
	editor.markHistoryStoppingPoint('after brainstorming board')
	editor.zoomToBounds(
		{ x: bounds.x, y: bounds.y - 40, w: bounds.w, h: bounds.h + 40 },
		{ inset: 48, targetZoom: 1 }
	)
}

export function BrainstormBoardButton() {
	const editor = useEditor()
	const isReadonly = useValue('brainstorm board readonly', () => editor.getIsReadonly(), [editor])

	return (
		<div className="tlui-menu" style={{ margin: 8, pointerEvents: 'all' }}>
			<TldrawUiButton
				type="normal"
				disabled={isReadonly}
				onClick={() => insertBrainstormBoard(editor)}
			>
				Insert brainstorming board
			</TldrawUiButton>
		</div>
	)
}
