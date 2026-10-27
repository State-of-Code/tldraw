import { Tldraw, TLComponents, useEditor, useValue } from 'tldraw'
import 'tldraw/tldraw.css'
import './basic.css'

const components: TLComponents = {
	SharePanel: ShapeCountBadge,
}

function ShapeCountBadge() {
	const editor = useEditor()
	const shapeCount = useValue('shape count', () => editor.getCurrentPageShapeIds().size, [editor])
	const selectedCount = useValue('selected count', () => editor.getSelectedShapeIds().length, [
		editor,
	])

	return (
		<div className="shape-count-badge" role="status" aria-live="polite" aria-atomic="true">
			<span>
				<strong>{shapeCount}</strong> {shapeCount === 1 ? 'shape' : 'shapes'}
			</span>
			<span className="shape-count-badge__separator" aria-hidden="true">
				·
			</span>
			<span>
				<strong>{selectedCount}</strong> selected
			</span>
		</div>
	)
}

export default function BasicExample() {
	return (
		<div className="tldraw__editor">
			<Tldraw components={components} />
		</div>
	)
}
