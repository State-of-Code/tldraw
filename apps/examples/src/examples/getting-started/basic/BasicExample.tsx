import { TLComponents, Tldraw, useEditor, useValue } from 'tldraw'
import 'tldraw/tldraw.css'
import './shape-count-badge.css'

function ShapeCountBadge() {
	const editor = useEditor()
	const total = useValue('shape count', () => editor.getCurrentPageShapeIds().size, [editor])
	const selected = useValue('selected shape count', () => editor.getSelectedShapeIds().length, [
		editor,
	])

	return (
		<div className="shape-count-badge" role="status" aria-label="Canvas shape counts">
			<span>
				<strong>{total}</strong> {total === 1 ? 'shape' : 'shapes'}
			</span>
			<span className="shape-count-badge__divider" aria-hidden="true" />
			<span>
				<strong>{selected}</strong> selected
			</span>
		</div>
	)
}

const components: TLComponents = {
	SharePanel: ShapeCountBadge,
}

export default function BasicExample() {
	return (
		<div className="tldraw__editor">
			<Tldraw components={components} />
		</div>
	)
}
