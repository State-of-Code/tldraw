import { TLComponents, Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { ShapeCountBadge } from './ShapeCountBadge'

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
