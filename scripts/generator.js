const ERROR_SCHEMA = 'Schema Error'
const ERROR_INVALID_CHARTTYPE = 'No valid chartType passed'

const DIMENTIONS = 1000

;(function() {
    const moduleName = 'generator'
    window[moduleName] = {}

    const charts = {
        'bar': {
            call: (data) => generator.generateBarChart(data),
        },
        'donut': {
            call: (data) => generator.generateDonutChart(data),
        },
        'line': {
            call: (data) => generator.generateLineChart(data),
        },
    }

    // Utility
    const isValid = (type) => Object.keys(charts).includes(type)
    const makeAppendingCallback = (theNode, persistencyAttrs = {}) => (parentNode) => {
        // 1. Remove existing children
        const existingChildren = Array.from(parentNode.children)
        if (existingChildren.length != 0) existingChildren.forEach(child => child.remove())

        // 2. Add the new wrapped node
        parentNode.appendChild(theNode)

        // 3. Set any final storage data for persistency - If it is newly created
        workspace.setStorageItemAttrs(parentNode.id, persistencyAttrs)
    }

    // Define functions
    Object.defineProperty(window[moduleName], 'generate', {
        writable: false,
        value: (chartType, rawData, existingConfigure) => {
            let node
            let error

            chartType = existingConfigure?.type || chartType
            rawData = existingConfigure?.rawData || rawData

            if (!isValid(chartType)) return new Error(ERROR_INVALID_CHARTTYPE)
            try {
                node = charts[chartType].call(rawData)
            } catch(resultingError) { error = resultingError; console.error('Generating chart resulted in error: ', resultingError) }
            if (!node) error = new Error(ERROR_INVALID_CHARTTYPE)
            if (error) return error

            return makeAppendingCallback(
                node,
                { type: chartType, rawData: rawData },
            )
        }
    })

    Object.defineProperty(window[moduleName], 'generateText', {
        writable: false,
        value: (existingConfigure) => {
            let labelText = existingConfigure?.label ?? prompt("Label text")
            if (!labelText) return

            const newLabel = document.createElement('span')
            newLabel.innerText = labelText
            return makeAppendingCallback(
                newLabel,
                { label: labelText },
            )
        }
    })

    Object.defineProperty(window[moduleName], 'generateImage', {
        writable: false,
        value: (existingConfigure) => {
            console.log(existingConfigure)
            let imageUrl = existingConfigure?.src ?? prompt("Image Url")
            if (!imageUrl) return

            const newImage = document.createElement('img')
            newImage.src = imageUrl
            newImage.style = '-webkit-user-drag: none'
            return makeAppendingCallback(
                newImage,
                { src: imageUrl },
            )
        }
    })

    Object.defineProperty(window[moduleName], 'generateBarChart', {
        writable: false,
        value: (data) => {
            // Validate data
            if (!Array.isArray(data) || data.length < 1) throw new Error(ERROR_SCHEMA)
            if (typeof data[0] !== 'object') throw new Error(ERROR_SCHEMA)
            if (
                !data[0].hasOwnProperty('key') ||
                !data[0].hasOwnProperty('value')
            ) throw new Error(ERROR_SCHEMA)

            // Declare the chart dimensions and margins.
            const marginTop = 30
            const marginRight = 0
            const marginBottom = 30
            const marginLeft = 60

            // Declare the x (horizontal position) scale.
            const x = d3.scaleBand()
                .domain(d3.groupSort(data, ([d]) => -d.value, (d) => d.key)) // descending frequency
                .range([marginLeft, DIMENTIONS - marginRight])
                .padding(0.1)
            
            // Declare the y (vertical position) scale.
            const y = d3.scaleLinear()
                .domain([0, d3.max(data, (d) => d.value)])
                .range([DIMENTIONS - marginBottom, marginTop])

            // Create the SVG container.
            const svg = d3.create("svg")
                .attr("width", DIMENTIONS)
                .attr("height", DIMENTIONS)
                .attr("viewBox", [0, 0, DIMENTIONS, DIMENTIONS])
                .attr("style", "max-width: 100%; height: auto;")

            // Add a rect for each bar.
            svg.append("g")
                .attr("fill", "steelblue")
                .selectAll()
                .data(data)
                .join("rect")
                .attr("x", (d) => x(d.key))
                .attr("y", (d) => y(d.value))
                .attr("height", (d) => y(0) - y(d.value))
                .attr("width", x.bandwidth())

            // Add the x-axis and label.
            svg.append("g")
                .attr("transform", `translate(0,${DIMENTIONS - marginBottom})`)
                .call(d3.axisBottom(x).tickSizeOuter(0))

            // Add the y-axis and label, and remove the domain line.
            svg.append("g")
                .attr("transform", `translate(${marginLeft},0)`)
                .call(d3.axisLeft(y).ticks(6).tickFormat((y) => (y * 100).toFixed()))
                .call(g => g.select(".domain").remove())

            // Return the SVG element.
            return svg.node()
        }
    })

    Object.defineProperty(window[moduleName], 'generateDonutChart', {
        writable: false,
        value: (data) => {
            // Validate data
            if (!Array.isArray(data) || data.length < 1) throw new Error(ERROR_SCHEMA)
            if (typeof data[0] !== 'object') throw new Error(ERROR_SCHEMA)
            if (
                !data[0].hasOwnProperty('key') ||
                !data[0].hasOwnProperty('value')
            ) throw new Error(ERROR_SCHEMA)
            
            // Declare the chart dimensions and margins.
            const radius = DIMENTIONS / 2

            // Declare pie components
            const arc = d3.arc()
                .innerRadius(radius * 0.67)
                .outerRadius(radius - 1)

            const pie = d3.pie()
                .padAngle(1 / radius)
                .sort(null)
                .value(d => d.value)

            const color = d3.scaleOrdinal()
                .domain(data.map(d => d.key))
                .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse())

            // Generate the SVG
            const svg = d3.create("svg")
                .attr("width", DIMENTIONS)
                .attr("height", DIMENTIONS)
                .attr("viewBox", [-DIMENTIONS / 2, -DIMENTIONS / 2, DIMENTIONS, DIMENTIONS])
                .attr("style", "max-width: 100%; height: auto;")

            svg.append("g")
                .selectAll()
                .data(pie(data))
                .join("path")
                .attr("fill", d => color(d.data.key))
                .attr("d", arc)
                .append("title")
                .text(d => `${d.data.key}: ${d.data.value.toLocaleString()}`)

            svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 12)
                .attr("text-anchor", "middle")
                .selectAll()
                .data(pie(data))
                .join("text")
                .attr("transform", d => `translate(${arc.centroid(d)})`)
                .call(text => text.append("tspan")
                    .attr("y", "-0.4em")
                    .attr("font-weight", "bold")
                    .text(d => d.data.key))
                .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
                    .attr("x", 0)
                    .attr("y", "0.7em")
                    .attr("fill-opacity", 0.7)
                    .text(d => d.data.value.toLocaleString("en-US")))

            // Return the SVG element.
            return svg.node();
        }
    })

    Object.defineProperty(window[moduleName], 'generateLineChart', {
        writable: false,
        value: (data) => {
            // Validate data
            if (!Array.isArray(data) || data.length < 1) throw new Error(ERROR_SCHEMA)
            if (typeof data[0] !== 'object') throw new Error(ERROR_SCHEMA)
            if (
                !data[0].hasOwnProperty('date') ||
                !data[0].hasOwnProperty('value')
            ) throw new Error(ERROR_SCHEMA)

            // Declare the chart dimensions and margins.
            const marginTop = 35
            const marginRight = 20
            const marginBottom = 45
            const marginLeft = 60

            // Declare the x (horizontal position) scale.
            const x = d3.scaleUtc(d3.extent(data, d => new Date(d.date)), [marginLeft, DIMENTIONS - marginRight]);

            // Declare the y (vertical position) scale.
            const y = d3.scaleLinear([0, d3.max(data, d => d.value)], [DIMENTIONS - marginBottom, marginTop]);

            // Declare the line generator.
            const line = d3.line()
                .x(d => x(new Date(d.date)))
                .y(d => y(d.value));

            // Create the SVG container.
            const svg = d3.create("svg")
                .attr("width", DIMENTIONS)
                .attr("height", DIMENTIONS)
                .attr("viewBox", [0, 0, DIMENTIONS, DIMENTIONS])
                .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

            // Add the x-axis.
            svg.append("g")
                .attr("transform", `translate(0,${DIMENTIONS - marginBottom})`)
                .call(d3.axisBottom(x).ticks(DIMENTIONS / 120).tickSizeOuter(0));

            // Add the y-axis, remove the domain line, add grid lines and a label.
            svg.append("g")
                .attr("transform", `translate(${marginLeft},0)`)
                .call(d3.axisLeft(y).ticks(DIMENTIONS / 80))
                .call(g => g.select(".domain").remove())
                .call(g => g.selectAll(".tick line").clone()
                    .attr("x2", DIMENTIONS - marginLeft - marginRight)
                    .attr("stroke-opacity", 0.1))

            // Append a path for the line.
            svg.append("path")
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 5)
                .attr("d", line(data));

            return svg.node();
        }
    })
})()