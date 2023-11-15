const ERROR_SCHEMA = 'Schema Error'
const ERROR_INVALID_CHARTTYPE = 'No valid chartType passed'

;(function() {
    const moduleName = 'generator'
    window[moduleName] = {}

    const charts = {
        'bar': {
            call: (data) => generator.generateBarChart(data),
            description: '',
            schema: {
                'key': String,
                'value': Number
            },
        },
    }
    const isValid = (type) => Object.keys(charts).includes(type)

    Object.defineProperty(window[moduleName], 'generate', {
        writable: false,
        value: (chartType, rawData) => {
            let node
            let error

            if (!isValid(chartType)) return new Error(ERROR_INVALID_CHARTTYPE)
            try {
                node = charts[chartType].call(rawData)
            } catch(resultingError) { error = resultingError }
            if (!node) error = new Error(ERROR_INVALID_CHARTTYPE) // Call Error API
            if (error) return error

            return (parentNode) => {
                const existingChildren = Array.from(parentNode.children)
                if (existingChildren.length != 0) existingChildren.forEach(child => child.remove())

                parentNode.appendChild(node)
            }
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
            const width = 500;
            const height = 500;
            const marginTop = 30;
            const marginRight = 0;
            const marginBottom = 30;
            const marginLeft = 40;

            // Declare the x (horizontal position) scale.
            const x = d3.scaleBand()
                .domain(d3.groupSort(data, ([d]) => -d.value, (d) => d.key)) // descending frequency
                .range([marginLeft, width - marginRight])
                .padding(0.1);
            
            // Declare the y (vertical position) scale.
            const y = d3.scaleLinear()
                .domain([0, d3.max(data, (d) => d.value)])
                .range([height - marginBottom, marginTop]);

            // Create the SVG container.
            const svg = d3.create("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .attr("style", "max-width: 100%; height: auto;");

            // Add a rect for each bar.
            svg.append("g")
                .attr("fill", "steelblue")
                .selectAll()
                .data(data)
                .join("rect")
                .attr("x", (d) => x(d.key))
                .attr("y", (d) => y(d.value))
                .attr("height", (d) => y(0) - y(d.value))
                .attr("width", x.bandwidth());

            // Add the x-axis and label.
            svg.append("g")
                .attr("transform", `translate(0,${height - marginBottom})`)
                .call(d3.axisBottom(x).tickSizeOuter(0));

            // Add the y-axis and label, and remove the domain line.
            svg.append("g")
                .attr("transform", `translate(${marginLeft},0)`)
                .call(d3.axisLeft(y).tickFormat((y) => (y * 100).toFixed()))
                .call(g => g.select(".domain").remove())
                .call(g => g.append("text")
                    .attr("x", -marginLeft)
                    .attr("y", 10)
                    .attr("fill", "currentColor")
                    .attr("text-anchor", "start")
                    .text("↑ Value (%)"));

            // Return the SVG element.
            return svg.node();
        }
    })
})()