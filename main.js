;(function() {
    const moduleName = 'handler'
    window[moduleName] = {}

    Object.defineProperty(window[moduleName], 'handleGenerate', {
        writable: false,
        value: (type) => {
            alert('Clicked generate button')
        }
    })
})()