;(function() {
    let dragNode

    let nodeStartX
    let nodeStartY

    let dragStartX
    let dragStartY

    let targetX
    let targetY

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
    const release = () => {
        if (dragNode) {
            workspace.setStorageItemAttrs(
                dragNode.id,
                { position: {
                    x: targetX,
                    y: targetY
                }}
            )
        }

        dragNode = null
        dragStartX = null
        dragStartY = null
        nodeStartX = null
        nodeStartY = null
        targetX = null
        targetY = null
    }

    document.addEventListener('mousedown', mousedown)
    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseup', release)
})()