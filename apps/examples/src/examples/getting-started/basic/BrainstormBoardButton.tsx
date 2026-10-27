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
	{ name: 'In Progress', color: 'light-blue' },
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
	const viewport = editor.getViewportScreenBounds()
	const left = 32
	const right = viewport.w >= 600 ? 240 : 32
	const top = viewport.w >= 600 ? 112 : 168
	const bottom = 80
	const boardHeight = bounds.h + 40
	const zoom = Math.min(
		1,
		Math.max(1, viewport.w - left - right) / bounds.w,
		Math.max(1, viewport.h - top - bottom) / boardHeight
	)
	// Reserve screen-space room for the controls, which zoomToBounds does not account for.
	editor.zoomToBounds(
		{
			x: bounds.x - left / zoom,
			y: bounds.y - 40 - top / zoom,
			w: bounds.w + (left + right) / zoom,
			h: boardHeight + (top + bottom) / zoom,
		},
		{ inset: 0, targetZoom: zoom }
	)
}

export function BrainstormBoardButton() {
	const editor = useEditor()
	const isReadonly = useValue('brainstorm board readonly', () => editor.getIsReadonly(), [editor])
	const isCompact = useValue(
		'brainstorm board compact layout',
		() => editor.getViewportScreenBounds().width < 600,
		[editor]
	)

	return (
		<div className="tlui-menu" style={{ margin: 8, pointerEvents: 'all' }}>
			<TldrawUiButton
				type="normal"
				disabled={isReadonly}
				aria-label="Insert brainstorming board"
				style={{ whiteSpace: 'nowrap', fontSize: isCompact ? 12 : undefined }}
				onClick={() => insertBrainstormBoard(editor)}
			>
				{isCompact ? 'Insert board' : 'Insert brainstorming board'}
			</TldrawUiButton>
		</div>
	)
}
