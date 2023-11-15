;(function() {
    const moduleName = 'json'
    window[moduleName] = {}

    Object.defineProperty(window[moduleName], 'fromFile', {
        writable: false,
        value: (input, onComplete) => {
            console.log('input', input)

            const file = input.files[0]
            if (!file) return

            const reader = new FileReader()
            reader.onerror = (error) => onComplete(error)
            reader.onload = (event) => {
                try { onComplete(JSON.parse(reader.result)) } 
                catch(error) {  onComplete(error) }
            }

            reader.readAsText(file)
        }
    })
})()