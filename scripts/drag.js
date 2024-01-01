;(function() {
    let dragNode

    let nodeStartX
    let nodeStartY

    let dragStartX
    let dragStartY

    const mousedown = (event) => {
        dragStartX = event.clientX
        dragStartY = event.clientY

        let n = event.target
        while (n != document.body && !dragNode) {
            console.log(n.classList)
            if (n.classList.contains('__can-drag')) {
                dragNode = n
                const styleMap = dragNode.computedStyleMap()
                nodeStartX = parseFloat(styleMap.get('left')?.value || 0)
                nodeStartY = parseFloat(styleMap.get('top')?.value || 0)
            } else {
                n = n.parentElement
            }
        }

        if (n != dragNode) {
            console.log('hover element is invalid', n)
        }
    }
    const mousemove = (event) => {
        if (!dragNode) return

        const currentX = event.clientX
        const currentY = event.clientY
        const offsetX = currentX - dragStartX
        const offsetY = currentY - dragStartY

        console.log('is dragging', offsetX, offsetY, dragStartX)
        dragNode.style.left = (offsetX + nodeStartX) + 'px'
        dragNode.style.top = (offsetY + nodeStartY) + 'px'
    }
    const release = () => {
        dragNode = null
        dragStartX = null
        dragStartY = null
        nodeStartX = null
        nodeStartY = null
    }

    document.addEventListener('mousedown', mousedown)
    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseup', release)
})()