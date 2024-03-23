;(function() {
    const moduleName = 'highlight'
    window[moduleName] = {}

    // Elements
    let highlightCanvas = document.querySelector('#canvas-pen')
    let context

    // Variables
    let isHighlighting = false
    let isMouseDown = false
    let arcs = []
    let previousXY = null
    
    // Configure the Canvas - Ensure it exists and is in the scene
    if (highlightCanvas) {
        context = highlightCanvas.getContext("2d")

        const mouseIsDown = () => {
            isMouseDown = false
            previousXY = null
        }
        highlightCanvas.addEventListener('mouseup', mouseIsDown)
        highlightCanvas.addEventListener('mouseleave', mouseIsDown)

        highlightCanvas.addEventListener('mousedown', () => (isMouseDown = true))

        highlightCanvas.addEventListener('mousemove', (e) => {
            if (!isHighlighting) return
            if (!isMouseDown) return
        
            if (previousXY) {
                context.lineTo(e.layerX, e.layerY);
                context.stroke();
                arcs.push([e.layerX, e.layerY])
            } else {
                context.strokeStyle = 'rgba(200, 200, 50)'
                context.lineWidth = 12
                context.moveTo(e.layerX, e.layerY);
                arcs.push([e.layerX, e.layerY])
            }

            previousXY = [
                e.layerX,
                e.layerY
            ]
        })
    } else {
        console.error('The Canvas has never been initialized! Please force refresh.')
    }

    // Functions
    Object.defineProperty(window[moduleName], 'toggleHighlighter', {
        writable: false,
        value: () => {
            isHighlighting = !isHighlighting

            // Allow interactions when highlighting
            highlightCanvas.style.pointerEvents = (isHighlighting)
                ? 'unset'
                : 'none'

            return isHighlighting
        }
    })
})()