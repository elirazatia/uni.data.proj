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
        // 1. Get the canvas context and configure the rendering
        context = highlightCanvas.getContext("2d")
        context.strokeStyle = 'rgba(200, 200, 50)'
        context.lineWidth = 12

        // 2. Assign all events
        const mouseIsUp = () => {
            isMouseDown = false
            previousXY = null
            workspace.arcs = arcs
        }
        const mouseIsDown = () => {
            isMouseDown = true
            arcs.push([])            
        }
        highlightCanvas.addEventListener('mouseup', mouseIsUp)
        highlightCanvas.addEventListener('mouseleave', mouseIsUp)
        highlightCanvas.addEventListener('mousedown', mouseIsDown)
        highlightCanvas.addEventListener('mousemove', (e) => {
            if (!isHighlighting || !isMouseDown) return
            if (previousXY &&
                    (previousXY[0] != e.layerX || previousXY[1] != e.layerY)) {
                context.lineTo(e.layerX, e.layerY);
                context.stroke();
                arcs[arcs.length - 1].push([e.layerX, e.layerY])
            } else if (!previousXY) {
                context.moveTo(e.layerX, e.layerY);
                arcs[arcs.length - 1].push([e.layerX, e.layerY])
            }

            previousXY = [e.layerX, e.layerY ]
        })

        // 3. Configure previous sessions config from localStorage
        const storedArcs = workspace.arcs
        arcs = storedArcs
        arcs.forEach(arcSet => {
            context.moveTo(arcSet[0][0], arcSet[1][1]);
            arcSet.slice(1).forEach(arcPoint => {
                context.lineTo(arcPoint[0], arcPoint[1])
                context.stroke()
            })
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