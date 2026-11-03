import { TLComponents, Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { BrainstormingControls } from './BrainstormingControls'

const components: TLComponents = {
	SharePanel: BrainstormingControls,
}

export default function BasicExample() {
	return (
		<div className="tldraw__editor">
			<Tldraw components={components} />
		</div>
	)
}
