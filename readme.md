# Comp1004 Project
This is the github page for my Comp1004 project - By Eliraz Atia. This will provide a basic run-through of the code and how to get started with using / modifiying it.

Please refer to the associated assignment final report for information about the SPA (Regarding the idea, history, UI, etc....)

## Get Started
To get started, download this project locally, and open the index.html File. Nothing more is needed.

Within the project you will find 3 .json files to use as reference for the data format:
data.json
data-2.json
data-timed.json

The first two are used for bar and donut charts, while the data-timed.json should be used for the line chart. This is due to the different format needed. Will be discussed more in section **Data Formats**

---
## Navigating The Code
`index.html` - This file uses tailwind for styling, except for a few exceptions. All buttons use the onclick event listener that connect to a function in the main.js file.
`main.js` - This script handles the UI and interactions between it and other modules, particulartly the sidebar navigation, and the handling users generation of charts, labels, and text.
`scripts/workspace.js` - Handles storage between localStorage and updates while the user interacts with the UI. By using a key-value based system it can easy let the drag.js and main.js update certain properties as they need. On refresh, this file will loop over all the elements and pass their stored attributes to the generator.js file
`scripts/generator.js` - This contains a function which, when passed data and a type, will generate an SVG. This is used by the main.js to generate user requested charts, and by the workspace.js to repopulate the canvas after the user refreshes.
This script also includes the function for generating the text and image elements.
Note that wrapping the elements in the correct classes and event handlers occurs in the main.js - as that deals with the UI.
`scripts/highlighter.js` - This file allows the user to draw on the canvas. By using a <canvas /> and a 2D context, a call to the mousedown will call context.moveTo() and context.lineTo()
In order to persist the users pen across uses, all drawings are stored in an array of arrays. Where the main array consists of sub-arrays that include all the points (x, y) that should be drawn.
`scripts/drag.js` - This contains no public methods, but rather attaches 4 event listeners to the #the-canvas element. Mousemove, down and release which when activated, use the transform methods on the dragged element. On release, this dispaches an event to the workspace.js file to persist the users interactions across events.
---
## Data Formats
Incorrect data formats when importing a JSON file will result in a non-fatal error.
#### Bar / Donut
Array of objects, each containing `{key: String, value: Float}`
#### Line
Array of objects, each containing `{date: ISO Date Format, value: Float}`