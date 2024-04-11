const ERROR_MESSAGE_TIMEOUT_MS = 4500

;(function() {
    const moduleName = 'errors'
    window[moduleName] = {}

    // The error container
    const errorContainer = document.querySelector('#error-container')

    // Internal functions
    const generateErrorContainer = (label) => {
        const newNode = document.createElement('div')
        newNode.classList.add(
            ...['mb-4', 'rounded-md', 'bg-red-900', 'px-2', 'py-3', 'leading-4'])

        const errorHeading = document.createElement('span')
        const errorMessage = document.createElement('span')
        const errorBreak = document.createElement('br')

        errorHeading.innerText = 'Oh No!'

        errorMessage.innerText = label
        errorMessage.classList.add(...['text-sm', 'opacity-60'])

        newNode.appendChild(errorHeading)
        newNode.appendChild(errorBreak)
        newNode.appendChild(errorMessage)
        return newNode
    }

    // Methods
    Object.defineProperty(window[moduleName], 'displayAndThrow', {
        writable: false,
        value: (error) => {
            let theMessage = (typeof error === 'string')
                ? error
                : error?.message || ''
            
            const errorNode = generateErrorContainer(theMessage)
            errorContainer?.appendChild(errorNode)

            setTimeout(
                () => errorNode.remove(),
                ERROR_MESSAGE_TIMEOUT_MS
            )
        }
    })
})()