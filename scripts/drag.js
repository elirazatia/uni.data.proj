;(function() {
    const canvasElement = document.querySelector('#chart-template')
    let dragNode

    let nodeStartX
    let nodeStartY

    let dragStartX
    let dragStartY

    let targetX
    let targetY

    const determineHighestZIndex = (moveElement) => {
        const canvas = document.querySelector('#the-canvas')
        if (!canvas)
            return console.info('No canvas element found. This an internal problem.')

        const parentElement = moveElement.parentElement
        moveElement.remove()
        parentElement.appendChild(moveElement)
    }

    const mousedown = (event) => {
        dragStartX = event.clientX
        dragStartY = event.clientY

        let n = event.target
        while (n != document.body && !dragNode) {
            if (n.classList.contains('__can-drag')) {
                dragNode = n
                const styleMap = dragNode.computedStyleMap()
                nodeStartX = parseFloat(styleMap.get('left')?.value || 0)
                nodeStartY = parseFloat(styleMap.get('top')?.value || 0)

                determineHighestZIndex(dragNode)
            } else {
                n = n.parentElement
            }
        }
    }
    const mousemove = (event) => {
        if (!dragNode) return

        const currentX = event.clientX
        const currentY = event.clientY
        const offsetX = currentX - dragStartX
        const offsetY = currentY - dragStartY
        
        targetX = offsetX + nodeStartX + 'px'
        targetY = offsetY + nodeStartY + 'px'

        dragNode.style.left = targetX
        dragNode.style.top = targetY
    }
    const release = (event) => {
        const hasMouseMoved = 
            (targetX != null && targetY != null)

        if (dragNode && hasMouseMoved) {
            workspace.setStorageItemAttrs(
                dragNode.id,
                { position: {
                    x: targetX,
                    y: targetY
                }}
            )
        } 
        
        if (!hasMouseMoved) {
            dragNode?.dispatchEvent(new Event('figureClick'))
            event.stopImmediatePropagation()
        }

        dragNode = null
        dragStartX = null
        dragStartY = null
        nodeStartX = null
        nodeStartY = null
        targetX = null
        targetY = null
    }

    canvasElement.addEventListener('mousedown', mousedown)
    canvasElement.addEventListener('mousemove', mousemove)
    
    document.addEventListener('mouseup', release)
})()