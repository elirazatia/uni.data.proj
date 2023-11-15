;(function() {
    const moduleName = 'handler'
    window[moduleName] = {}

    Object.defineProperty(window[moduleName], 'handleGenerate', {
        writable: false,
        value: (type) => {
            const response = generator.generate('bar', [{ key: 'F', value: 0.4 }, { key: 'G', value: 0.13 }])
            if (response instanceof Error) return console.error(response)
            response(document.querySelector('#body-template'))
            console.log('response', response)
        }
    })
})()