// All Figma Plugin Messages

const createRectangles = (count) => {
  parent.postMessage({ pluginMessage: { type: 'create-rectangles', count } }, '*')
}

const closePlugin = () => {
  parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
}

export { createRectangles, closePlugin }