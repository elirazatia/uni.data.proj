const ERROR_INVALID_ID = 'No valid chartType passed'
const ERROR_INVALID_POSITION = 'No valid chartType passed'
const ERROR_INVALID_SIZE = 'No valid chartType passed'
const ERROR_INVALID_ATTRIBUTES = ''

const WORKSPACE_LOCALSTORAGE_KEY = 'workspace'
const NAME_LOCALSTORAGE_KEY = 'name'
const NAME_LOCALSTORAGE_ARCS = 'arcs'

const NAME_LABEL_FORMAT = (name) => 'Hello, ' + name
let isInitingStorage = false

;(function() {
    const moduleName = 'workspace'
    window[moduleName] = {}

    // The Workspace
    let items = {}

    // Utility methods
    const fetchStorage = () => {
        try {
            const itemsString = localStorage.getItem(WORKSPACE_LOCALSTORAGE_KEY)
            const itemsObject = JSON.parse(itemsString)
            items = itemsObject || {}
        } catch(error) {
            items = {}
            throw error // Propegate the error handling
        }
    }
    const setStorage = () => {
        localStorage.setItem(
            WORKSPACE_LOCALSTORAGE_KEY,
            JSON.stringify(items))
    }
    
    // Global Getters
    Object.defineProperty(window[moduleName], 'items', {
        get() { return items }
    })

    Object.defineProperty(window[moduleName], 'username', {
        get() {
            // Not best practice; But update name label; defer tag on scripts means this file won't run until the DOM is rendered
            const theName = localStorage.getItem(NAME_LOCALSTORAGE_KEY) ?? null
            document.querySelector('#user-name').innerText = NAME_LABEL_FORMAT(theName)

            return theName
        },
        set(newName) { 
            if (typeof newName !== 'string') return
            
            localStorage.setItem(NAME_LOCALSTORAGE_KEY, newName) ?? null
            document.querySelector('#user-name').innerText = NAME_LABEL_FORMAT(newName)
        }
    })

    Object.defineProperty(window[moduleName], 'arcs', {
        get() {
            let items = localStorage.getItem(NAME_LOCALSTORAGE_ARCS) ?? ''
            try {
                return JSON.parse(items)
            } catch {
                return []
            }
        },
        set(newArcs) {
            if (!Array.isArray(newArcs)) return

            const arcs = newArcs
                .filter(arr => arr?.length > 0)
            localStorage.setItem(NAME_LOCALSTORAGE_ARCS, JSON.stringify(arcs)) ?? null
        }
    })

    // Define functions
    Object.defineProperty(window[moduleName], 'fetchStorage', {
        writable: false,
        value: () => {
            // 1. Set initingStorage to true
            isInitingStorage = true

            // 2. Fetch the storage
            fetchStorage()

            // 3. Run over each item and insert them
            Object.keys(items).forEach(itemId => {
                const itemAttrs = items[itemId]
                handler.generateStoredFigure(itemId, itemAttrs)
            })

            // 4. Set initingStorage to false to allow new entries
            isInitingStorage = false
        }
    })

    Object.defineProperty(window[moduleName], 'removeStorageItem', {
        writable: false,
        value: (id) => {
            if (typeof id !== 'string') return console.error(ERROR_INVALID_ID)

            delete items[id]
            setStorage()
        }
    })

    Object.defineProperty(window[moduleName], 'setStorageItemAttrs', {
        writable: false,
        value: (id, attrs) => {
            if (isInitingStorage) return
            if (typeof id !== 'string') return console.error(ERROR_INVALID_ID)
            if (typeof attrs !== 'object') return console.error(ERROR_INVALID_ATTRIBUTES)

            items[id] = {
                ...(items[id] || {}),
                ...attrs
            }

            setStorage()
        }
    })
})()