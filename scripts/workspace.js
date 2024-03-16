const ERROR_INVALID_ID = 'No valid chartType passed'
const ERROR_INVALID_POSITION = 'No valid chartType passed'
const ERROR_INVALID_SIZE = 'No valid chartType passed'
const ERROR_INVALID_ATTRIBUTES = ''

const WORKSPACE_LOCALSTORAGE_KEY = 'workspace'

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
            items = itemsObject
            console.log('items')
        } catch(error) {
            items = {}
            console.info('Something went wrong while fetching your storage!')
        }
    }
    const setStorage = () => {
        localStorage.setItem(
            WORKSPACE_LOCALSTORAGE_KEY,
            JSON.stringify(items))
    }

    // Define functions
    Object.defineProperty(window[moduleName], 'fetchStorage', {
        writable: false,
        value: () => {
            // 1. Fetch the storage
            fetchStorage()

            // 2. Run over each item and insert them
            Object.keys(items).forEach(itemId => {
                const itemAttrs = items[itemId]

                // 3. Do whatever you need to with each item and attribute
                if (itemAttrs.rawData && itemAttrs.type) {
                    alert('Create chart')
                } else if (itemAttrs.label) {
                    alert('Create label')
                } else if (itemAttrs.src) {
                    alert('Create image from attribute')
                }
            })
        }
    })

    // Object.defineProperty(window[moduleName], 'addStoreItem', {
    //     writable: false,
    //     value: (id, position, size) => {
    //         if (typeof id !== 'string') return console.error(ERROR_INVALID_ID)

    //         if (typeof newPosition?.x !== 'string' ||
    //             typeof newPosition?.y !== 'string') return console.error(ERROR_INVALID_POSITION)

    //         if (typeof size?.w !== 'string' ||
    //             typeof size?.h !== 'string') return console.error(ERROR_INVALID_SIZE)
            
    //         items[id] = {
    //             ...(items[id] || {}),
    //             position,
    //             size
    //         }
        
    //         setStorage()
    //     }
    // })

    Object.defineProperty(window[moduleName], 'removeStorageItem', {
        writable: false,
        value: (id) => {
            if (typeof id !== 'string') return console.error(ERROR_INVALID_ID)

            delete items[id]
            setStorage()
        }
    })

    // Object.defineProperty(window[moduleName], 'setStorageItemPosition', {
    //     writable: false,
    //     value: (id, newPosition) => {
    //         if (typeof newPosition?.x !== 'string' ||
    //             typeof newPosition?.y !== 'string') return console.error(ERROR_INVALID_POSITION)
    //         items[id] = {
    //             position, size
    //         }
    //         setStorage()
    //     }
    // })

    Object.defineProperty(window[moduleName], 'setStorageItemAttrs', {
        writable: false,
        value: (id, attrs) => {
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