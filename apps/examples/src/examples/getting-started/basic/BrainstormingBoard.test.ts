import { Box, createShapeId, TLFrameShape, TLNoteShape, toRichText } from 'tldraw'
import { TestEditor } from '../../../../../../packages/tldraw/src/test/TestEditor'
import { insertBrainstormingBoard } from './BrainstormingBoard'

let editor: TestEditor

beforeEach(() => {
	editor = new TestEditor()
	vi.spyOn(editor, 'zoomToBounds').mockReturnValue(editor)
})

afterEach(() => {
	vi.restoreAllMocks()
	editor.dispose()
})

describe('brainstorming board insertion', () => {
	it('creates three named columns containing three blank notes each', () => {
		insertBrainstormingBoard(editor)

		const shapes = editor.getCurrentPageShapes()
		const frames = shapes.filter((shape): shape is TLFrameShape => shape.type === 'frame')
		const notes = shapes.filter((shape): shape is TLNoteShape => shape.type === 'note')
		expect(frames.map((shape) => shape.props.name)).toEqual(['Ideas', 'In Progress', 'Done'])
		expect(notes).toHaveLength(9)
		expect(notes.map((note) => note.props.richText)).toEqual(Array(9).fill(toRichText('')))
		expect(
			frames.map((frame) => notes.filter((note) => note.parentId === frame.id).length)
		).toEqual([3, 3, 3])
		expect([...new Set(notes.map((note) => note.props.color))]).toEqual([
			'yellow',
			'light-blue',
			'light-green',
		])
		expect(editor.zoomToBounds).toHaveBeenCalledOnce()
	})

	it('keeps notes editable and movable into another column', () => {
		insertBrainstormingBoard(editor)
		const frames = editor.getCurrentPageShapes().filter((shape) => shape.type === 'frame')
		const note = editor.getCurrentPageShapes().find((shape) => shape.type === 'note')!

		editor.reparentShapes([note.id], frames[1].id)
		editor.updateShape({
			id: note.id,
			type: 'note',
			x: 40,
			y: 40,
			props: { richText: toRichText('A new idea') },
		})
		expect(editor.getShape<TLNoteShape>(note.id)).toMatchObject({
			parentId: frames[1].id,
			x: 40,
			y: 40,
			isLocked: false,
			props: { richText: toRichText('A new idea') },
		})
	})

	it('places repeated boards without overlapping existing shapes', () => {
		insertBrainstormingBoard(editor)
		const firstBoardShapes = editor.getCurrentPageShapes()
		const firstBoardBounds = Box.Common(
			firstBoardShapes.map((shape) => editor.getShapePageBounds(shape)!)
		)
		insertBrainstormingBoard(editor)
		const firstIds = new Set(firstBoardShapes.map((shape) => shape.id))
		const secondBoardShapes = editor
			.getCurrentPageShapes()
			.filter((shape) => !firstIds.has(shape.id))
		const secondBoardBounds = Box.Common(
			secondBoardShapes.map((shape) => editor.getShapePageBounds(shape)!)
		)

		expect(secondBoardShapes).toHaveLength(12)
		expect(firstBoardBounds.collides(secondBoardBounds)).toBe(false)
	})

	it('preserves existing content and removes the whole board with one undo', () => {
		const existingId = createShapeId()
		editor.createShape({ id: existingId, type: 'geo', x: 0, y: 0 })
		const existing = editor.getShape(existingId)
		insertBrainstormingBoard(editor)
		const existingBounds = editor.getShapePageBounds(existingId)!
		const boardBounds = Box.Common(
			editor
				.getCurrentPageShapes()
				.filter((shape) => shape.id !== existingId)
				.map((shape) => editor.getShapePageBounds(shape)!)
		)
		expect(existingBounds.collides(boardBounds)).toBe(false)
		expect(editor.getCurrentPageShapes()).toHaveLength(13)

		editor.undo()
		expect(editor.getCurrentPageShapes()).toEqual([existing])
		editor.redo()
		expect(editor.getCurrentPageShapes()).toHaveLength(13)
	})
})
