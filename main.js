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

    // Utility
    const makeDraggerWrappable = (storeIntoWorkspace) => {
        const wrapper = document.createElement('div')
        document.querySelector('#chart-template').appendChild(wrapper)

        // TODO: Add wrapper; Drag and delete buttons
        const id = Math.random().toString().slice(3, 7)

        wrapper.id = id
        wrapper.classList.add('select-none')
        wrapper.classList.add('z-8')
        wrapper.classList.add('w-64')
        wrapper.classList.add('absolute')
        wrapper.classList.add('__can-drag')
        wrapper.classList.add('cursor-grab')
        wrapper.style.left = 0
        wrapper.style.top = 0

        wrapper.addEventListener('contextmenu', (event) => {
            event.stopImmediatePropagation()
            event.preventDefault()

            const confirmDelete = confirm("Delete?")
            if (confirmDelete) {
                wrapper.remove()
                workspace.removeStorageItem(id)
            }
        })

        if (storeIntoWorkspace) {
            workspace.setStorageItemAttrs(
                id, 
                {
                    size: { w: 64, h: 12 },
                    position: { x: 0, y: 0 }
                })
        }

        return wrapper
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
    console.info('Your name', workspace.username)
    if (!workspace.username) {
        const attemptPrompt = () => {
            const theNewUsername = prompt('Hey, what is your name? (Min 3 chars)')
            if (!theNewUsername || theNewUsername.length < 3) return attemptPrompt()

            workspace.username = theNewUsername
        }

        attemptPrompt()
    }

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
            draggableWrapper = makeDraggerWrappable(true)
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

            draggableWrapper = makeDraggerWrappable(true)
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