import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { Box, createShapeId, EditorContext, TLFrameShape, TLNoteShape, toRichText } from 'tldraw'
import { TestEditor } from '../../../../../../packages/tldraw/src/test/TestEditor'
import { insertBrainstormingBoard } from './BrainstormingBoard'
import { BrainstormingControls } from './BrainstormingControls'

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
		expect(frames.map((shape) => shape.props.name)).toEqual(['Ideas', 'In progress', 'Done'])
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

	it.each([
		{ w: 320, h: 320, controlsHeight: 144, x: 0, y: 0 },
		{ w: 320, h: 360, controlsHeight: 168, x: 40, y: 80 },
		{ w: 568, h: 320, controlsHeight: 104, x: 0, y: 0 },
		{ w: 1080, h: 720, controlsHeight: 48, x: 0, y: 0 },
	])(
		'fits every column below $controlsHeight-pixel controls in a $w × $h viewport',
		({ w, h, controlsHeight, x, y }) => {
			vi.mocked(editor.zoomToBounds).mockRestore()
			const zoomToBounds = editor.zoomToBounds.bind(editor)
			vi.spyOn(editor, 'zoomToBounds').mockImplementation((bounds, options) =>
				zoomToBounds(bounds, { ...options, animation: undefined, immediate: true })
			)
			editor.setScreenBounds({ x, y, w, h })
			const controlsBottom = y + controlsHeight

			insertBrainstormingBoard(editor, { controlsBottom })

			const bounds = Box.Common(
				editor
					.getCurrentPageShapes()
					.filter((shape) => shape.type === 'frame')
					.map((frame) => editor.getShapePageBounds(frame)!)
			)
			const topLeft = editor.pageToScreen({ x: bounds.minX, y: bounds.minY })
			const bottomRight = editor.pageToScreen({ x: bounds.maxX, y: bounds.maxY })

			// Frame headings sit above their shape bounds and do not shrink at ordinary zoom levels.
			expect(topLeft.y - 32).toBeGreaterThanOrEqual(controlsBottom - 0.001)
			expect(bottomRight.y).toBeLessThanOrEqual(y + h - 72 + 0.001)
			expect(topLeft.x).toBeGreaterThanOrEqual(x + 16 - 0.001)
			expect(bottomRight.x).toBeLessThanOrEqual(x + w - 16 + 0.001)
		}
	)

	it('measures the controls again on every insertion after their layout changes', () => {
		vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
		const container = document.createElement('div')
		document.body.append(container)
		const root = createRoot(container)
		editor.setScreenBounds({ x: 40, y: 80, w: 320, h: 360 })
		try {
			act(() =>
				root.render(
					createElement(
						EditorContext.Provider,
						{ value: editor },
						createElement(BrainstormingControls)
					)
				)
			)
			const controls = container.querySelector<HTMLElement>(
				'[aria-label="Brainstorming controls"]'
			)!
			const measureControls = vi.spyOn(controls, 'getBoundingClientRect')
			const button = Array.from(controls.querySelectorAll('button')).find(
				(button) => button.textContent === 'Insert brainstorming board'
			)!

			for (const controlsHeight of [104, 168]) {
				measureControls.mockReturnValue(
					DOMRect.fromRect({ x: 40, y: 80, width: 200, height: controlsHeight })
				)
				act(() => button.click())
				const framingBounds = vi.mocked(editor.zoomToBounds).mock.lastCall![0]
				const zoom = Math.min(320 / framingBounds.w, 360 / framingBounds.h)
				const frames = editor.getCurrentPageShapes().filter((shape) => shape.type === 'frame')
				const boardTop = frames[frames.length - 1].y
				const topOnScreen =
					80 + (360 - framingBounds.h * zoom) / 2 + (boardTop - framingBounds.y) * zoom
				expect(topOnScreen - 32).toBeGreaterThanOrEqual(80 + controlsHeight - 0.001)
			}
			expect(measureControls).toHaveBeenCalledTimes(2)
		} finally {
			act(() => root.unmount())
			container.remove()
			vi.unstubAllGlobals()
		}
	})
})
