;(function() {
    // Module Config
    const moduleName = 'handler'
    window[moduleName] = {}

    // General Memory Values
    let mostRecentUpload
    let mostRecentUploadWaiter
    let newChartTypeKey
    const setRecentUpload = (content) => {
        mostRecentUpload = content
        mostRecentUploadWaiter?.call(content)
    }
    const getRecentUpload = (callback) => {
        if (mostRecentUpload) callback(mostRecentUpload)
        mostRecentUploadWaiter = callback
    }

    let createChartStagesUI = [...document.querySelectorAll('.sidebar-timeline-item')]
        .sort((a, b) => a.getAttribute('order') - b.getAttribute('order'))
    const setActiveChartStageUIUntil = (index) => createChartStagesUI.forEach(element => {
        const order = parseInt(element.getAttribute('order'))
        if (!order) return
        if (order == index) {
            element.style.opacity = 1
            element.style.pointerEvents = 'unset'
        } else {
            element.style.opacity = 0.2
            element.style.pointerEvents = 'none'
        }
    })

    // On App Bootup
    setActiveChartStageUIUntil(1)

    // Define functions
    Object.defineProperty(window[moduleName], 'simulateFileUpload', {
        writable: false,
        value: () => {
            document.querySelector('input[type=file]').click()
        }
    })

    Object.defineProperty(window[moduleName], 'handle', {
        writable: false,
        value: async (input) => {
            const fileResponse = await json.fromFile(input)
            if (fileResponse instanceof Error) return console.error('Handled with error', fileResponse)
            setRecentUpload(fileResponse)
        }
    })

    Object.defineProperty(window[moduleName], 'import', {
        writable: false,
        value: async () => {
            setActiveChartStageUIUntil(1)
            getRecentUpload((data) => {
                setActiveChartStageUIUntil(2)
            })

            // Call the function to perform the file uplaod
            window[moduleName].simulateFileUpload()
        }
    })

    Object.defineProperty(window[moduleName], 'chooseChart', {
        writable: false,
        value: (key) => {
            newChartTypeKey = key
            setActiveChartStageUIUntil(3)
        }
    })

    Object.defineProperty(window[moduleName], 'confirmChart', {
        writable: false,
        value: () => {
            console.log('should confirm chart', newChartTypeKey)
            generatorResponse = generator.generate(newChartTypeKey, mostRecentUpload)
            if (generatorResponse instanceof Error) return console.error(generatorResponse)

            const newChartElement = document.createElement('div')
            document.querySelector('#chart-template').appendChild(newChartElement)
            // TODO: Add wrapper; Drag and delete buttons
            newChartElement.classList.add('z-8')
            newChartElement.classList.add('w-64')
            newChartElement.classList.add('absolute')
            generatorResponse(
                newChartElement  
            ) 

            setActiveChartStageUIUntil(1)
        }
    })

    Object.defineProperty(window[moduleName], 'cancelChart', {
        writable: false,
        value: () => {
            mostRecentUpload = null
            mostRecentUploadWaiter = null

            setActiveChartStageUIUntil(1)
        }
    })
})()