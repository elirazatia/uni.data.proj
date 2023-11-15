;(function() {
    const moduleName = 'handler'
    window[moduleName] = {}

    Object.defineProperty(window[moduleName], 'handleGenerate', {
        writable: false,
        value: (type) => {
            const response = generator.generate('bar', [{ key: 'F', value: 14 }])
            console.log('response', response)
        }
    })
})()