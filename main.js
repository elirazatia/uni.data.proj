;(function() {
    const moduleName = 'handler'
    window[moduleName] = {}

    Object.defineProperty(window[moduleName], 'handle', {
        writable: false,
        value: async (input) => {
            const fileResponse = await json.fromFile(input)
            if (fileResponse instanceof Error) return console.error('Handled with error', fileResponse)

            generatorResponse = generator.generate('bar', fileResponse)
            if (generatorResponse instanceof Error) return console.error(generatorResponse)
            generatorResponse(
                document.querySelector('#body-template')
            )
        }
    })
})()