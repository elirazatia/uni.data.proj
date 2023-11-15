;(function() {
    const moduleName = 'json'
    window[moduleName] = {}

    Object.defineProperty(window[moduleName], 'fromFile', {
        writable: false,
        value: async (input, onComplete) => new Promise((resolve) => {
            const file = input.files[0]
            if (!file) return

            const reader = new FileReader()
            reader.onerror = (error) => resolve(error)
            reader.onload = (event) => {
                try { resolve(JSON.parse(reader.result)) } 
                catch(error) { resolve(error) }
            }

            reader.readAsText(file)
        })
    })
})()