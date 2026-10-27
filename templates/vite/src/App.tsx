import { Tldraw, useEditor, useValue } from 'tldraw'
import { BrainstormTimer, BrainstormTimerProvider } from './BrainstormTimer'
import BrainstormBoard from './BrainstormBoard'

function ShapeCounter() {
	const editor = useEditor()
	const shapeCount = useValue('shape count', () => editor.getCurrentPageShapes().length, [editor])
	const selectedCount = useValue('selection count', () => editor.getSelectedShapeIds().length, [editor])

	return (
		<div
			className="tlui-menu"
			style={{
				margin: 8,
				padding: '10px 14px',
				borderRadius: 12,
				fontSize: 13,
				fontWeight: 500,
				color: 'var(--tl-color-text-1)',
				background: 'var(--tl-color-panel)',
				boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
				pointerEvents: 'none',
			}}
			title="Objects on the current page and in your selection"
		>
			{shapeCount} {shapeCount === 1 ? 'shape' : 'shapes'}
			<span style={{ opacity: 0.55, margin: '0 8px' }}>·</span>
			{selectedCount} selected
		</div>
	)
}

function DemoPanel() {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, padding: 8, maxWidth: 'calc(100vw - 100px)' }}>
			<ShapeCounter />
			<BrainstormBoard />
			<BrainstormTimer />
		</div>
	)
}

const components = { SharePanel: DemoPanel }

function App() {
	return (
		<div style={{ position: 'fixed', inset: 0 }}>
<BrainstormTimerProvider>
<Tldraw components={components} />
</BrainstormTimerProvider>
		</div>
	)
}

export default App
