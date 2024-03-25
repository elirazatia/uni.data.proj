;(function() {
    // Module Config
    const moduleName = 'handler'
    window[moduleName] = {}

    // General Memory Values
    let mostRecentUpload
    let mostRecentUploadWaiter
    let newChartTypeKey
    const clearRecentUpload = () => {
        mostRecentUpload = null
        mostRecentUploadWaiter = null
    }
    const setRecentUpload = (content) => {
        mostRecentUpload = content
        mostRecentUploadWaiter(content)
    }
    const getRecentUpload = (callback) => {
        if (mostRecentUpload) callback(mostRecentUpload)
        mostRecentUploadWaiter = callback
    }

    // Utility
    const makeDraggerWrappable = (existingID) => {
        const wrapper = document.createElement('div')
        document.querySelector('#chart-template').appendChild(wrapper)

        const id = existingID ?? Math.random().toString().slice(3, 7)

        wrapper.id = id
        wrapper.classList.add('select-none')
        wrapper.classList.add('w-[350px]')
        wrapper.classList.add('z-8')
        wrapper.classList.add('absolute')
        wrapper.classList.add('__can-drag')
        wrapper.classList.add('cursor-grab')
        wrapper.style.left = 0
        wrapper.style.top = 0

        wrapper.addEventListener('figureClick', async (e) => {
            const itemAttrs = workspace.items
            let staticAttributes = JSON.parse(
                JSON.stringify(itemAttrs[id]))

            const dataHasUpdated = () => {
                try { 
                    const element = handler.generateStoredFigure(id, staticAttributes, true) // Call .generateStoredFigures() first as it may fail with bad data, and will catch() rather than ruin the data integrity
                    workspace.setStorageItemAttrs(id, staticAttributes)
                    element(wrapper)
                } catch(error) {
                    alert('Failed to update with new data : ' + error.message)
                }    
            }

            switch(window[moduleName].determineConfigurationFigureType(staticAttributes)) {
                case FIGURE_TYPE_CHART:
                    clearRecentUpload()
                    getRecentUpload((data) => {
                        staticAttributes.rawData = data
                        dataHasUpdated()
                    })

                    await window[moduleName].simulateFileUpload()
                    break
                case FIGURE_TYPE_TEXT:
                    let newLabel = prompt("Label text", staticAttributes.label)
                    staticAttributes.label = newLabel
                    dataHasUpdated()
                    break
                case FIGURE_TYPE_IMAGE:
                    let newImageUrl = prompt("Image Url", staticAttributes.src)
                    staticAttributes.src = newImageUrl
                    dataHasUpdated()
                    break
            }
        })

        wrapper.addEventListener('contextmenu', (event) => {
            event.stopImmediatePropagation()
            event.preventDefault()

            const confirmDelete = confirm("Delete?")
            if (confirmDelete) {
                wrapper.remove()
                workspace.removeStorageItem(id)
            }
        })

        workspace.setStorageItemAttrs(
            id, 
            {
                size: { w: 64, h: 12 },
                position: { x: 0, y: 0 },
            },
            true
        )

        return wrapper
    }

    let createChartStagesUI = [...document.querySelectorAll('.sidebar-timeline-item')]
        .sort((a, b) => a.getAttribute('order') - b.getAttribute('order'))

    const setActiveChartStageUIUntil = (index) => createChartStagesUI.forEach(element => {
        const order = parseInt(element.getAttribute('order'))
        if (!order) return
        element.setAttribute('disabled', (order == index) ? 'false' : 'true')
    })

    // On App Bootup
    // Delay all initial bootup functions to ensure that everything is prepared
    setTimeout(() => {
        // 1. Correctly configure the UI
        setActiveChartStageUIUntil(1)

        // 2. Get the users name
        if (!workspace.username) {
            const attemptPrompt = () => {
                const theNewUsername = prompt('Hey, what is your name? (Min 3 chars)')
                if (!theNewUsername || theNewUsername.length < 3) return attemptPrompt()
    
                workspace.username = theNewUsername
            }
    
            attemptPrompt()
        }

        // 3. Load from storage
        workspace.fetchStorage()
    }, 10)

    // Define functions
    const FIGURE_TYPE_CHART = 2
    const FIGURE_TYPE_TEXT = 3
    const FIGURE_TYPE_IMAGE = 4
    Object.defineProperty(window[moduleName], 'determineConfigurationFigureType', {
        writable: false,
        value: (configuration) => {
            if (configuration.rawData && configuration.type) return FIGURE_TYPE_CHART
            else if (configuration.label) return FIGURE_TYPE_TEXT
            else if (configuration.src) return FIGURE_TYPE_IMAGE
        }
    })
    Object.defineProperty(window[moduleName], 'generateStoredFigure', {
        writable: false,
        value: (id, configuration, dontPlaceIntoCanvas) => {
            let newEl;
            switch(window[moduleName].determineConfigurationFigureType(configuration)) {
                case FIGURE_TYPE_CHART:
                    newEl = generator.generate(null, null, configuration)
                    break
                case FIGURE_TYPE_TEXT:
                    newEl = generator.generateText(configuration)
                    break
                case FIGURE_TYPE_IMAGE:
                    newEl = generator.generateImage(configuration)
                    break
            }

            if (dontPlaceIntoCanvas)
                return newEl

            draggableWrapper = makeDraggerWrappable(id)
            newEl(draggableWrapper)

            draggableWrapper.style.top = configuration?.position?.y || '0px'
            draggableWrapper.style.left = configuration?.position?.x || '0px'
        }
    })

    Object.defineProperty(window[moduleName], 'clearWorkspace', {
        writable: false,
        value: async (input) => {
            const willContinue = confirm("Are you sure you want to clear your workspace? This cannot be undone.")
            if (!willContinue) return
            
            localStorage.clear()
            location.reload()
        }
    })

    Object.defineProperty(window[moduleName], 'simulateFileUpload', {
        writable: false,
        value: () => {
            document.querySelector('input[type=file]').click()
        }
    })

    Object.defineProperty(window[moduleName], 'handle', {
        writable: false,
        value: async (input) => {
            console.log('thze input')
            const fileResponse = await json.fromFile(input)
            console.log(fileResponse)
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

    Object.defineProperty(window[moduleName], 'toggleHighlighter', {
        writable: false,
        value: () => {
            let isToggled = highlight.toggleHighlighter()
            const highlightTool = document.querySelector('#highlight-selector')
            if (!highlightTool) return

            const className = 'scale-125'
            if (isToggled) highlightTool.classList.add(className)
            else highlightTool.classList.remove(className)
        }
    })

    Object.defineProperty(window[moduleName], 'chooseFigure', {
        writable: false,
        value: (key) => {
            let figureResponse
            switch (key) {
                case 'text':
                    figureResponse = generator.generateText()
                    break
                case 'image':
                    figureResponse = generator.generateImage()
                    break
                default: return
            }

            if (!figureResponse) return console.info('Cancelled insert! Nothing to insert.')
            draggableWrapper = makeDraggerWrappable()
            figureResponse(draggableWrapper)
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
            generatorResponse = generator.generate(newChartTypeKey, mostRecentUpload)
            if (generatorResponse instanceof Error) return console.error(generatorResponse)

            draggableWrapper = makeDraggerWrappable()
            generatorResponse(draggableWrapper)

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