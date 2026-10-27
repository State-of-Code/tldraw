import { createShapeId, toRichText, useEditor, useValue } from 'tldraw'
import type { TLFrameShape, TLNoteShape, TLShapePartial } from 'tldraw'

const COLUMN_WIDTH = 280
const COLUMN_HEIGHT = 560
const COLUMN_GAP = 32
const BOARD_WIDTH = COLUMN_WIDTH * 3 + COLUMN_GAP * 2

export default function BrainstormBoard() {
  const editor = useEditor()
  const isReadonly = useValue('brainstorm board readonly', () => editor.getIsReadonly(), [editor])

  function insertBoard() {
    if (editor.getIsReadonly()) return
    const existing = editor.getCurrentPageBounds()
    const center = editor.getViewportPageBounds().center
    const x = existing ? existing.maxX + 100 : center.x - BOARD_WIDTH / 2
    const y = existing ? existing.y : center.y - COLUMN_HEIGHT / 2
    const shapes: TLShapePartial<TLFrameShape | TLNoteShape>[] = []
    const columns = [
      { name: 'Ideas', color: 'yellow' },
      { name: 'In progress', color: 'light-blue' },
      { name: 'Done', color: 'light-green' },
    ] as const

    for (const [index, column] of columns.entries()) {
      const frameId = createShapeId()
      shapes.push({
        id: frameId, type: 'frame', parentId: editor.getCurrentPageId(),
        x: x + index * (COLUMN_WIDTH + COLUMN_GAP), y,
        props: { w: COLUMN_WIDTH, h: COLUMN_HEIGHT, name: column.name },
      })
      for (let row = 0; row < 2; row++) {
        shapes.push({
          id: createShapeId(), type: 'note', parentId: frameId,
          x: 40, y: 48 + row * 240,
          props: { color: column.color, richText: toRichText('') },
        })
      }
    }
    editor.markHistoryStoppingPoint('before-brainstorm-board')
    editor.run(() => editor.createShapes(shapes))
    editor.markHistoryStoppingPoint('after-brainstorm-board')
    editor.zoomToBounds(
      { x, y: y - 40, w: BOARD_WIDTH, h: COLUMN_HEIGHT + 40 },
      { inset: 48, targetZoom: 1 }
    )
  }

  return (
    <button type="button"
      aria-label="Add brainstorming board with Ideas, In progress, and Done columns"
      title="Add a brainstorming board. Undo removes the whole board."
      disabled={isReadonly}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={insertBoard}
      style={{
        minHeight: 32, padding: '6px 10px',
        border: '1px solid var(--tl-color-divider, #d8d8dc)',
        borderRadius: 8, background: 'var(--tl-color-panel, #fff)',
        color: 'var(--tl-color-text-1, #222)', font: 'inherit',
        fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
        cursor: isReadonly ? 'not-allowed' : 'pointer',
        opacity: isReadonly ? 0.5 : 1, pointerEvents: 'all',
      }}>
      + Brainstorm board
    </button>
  )
}
