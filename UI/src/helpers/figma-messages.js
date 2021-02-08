// All Figma Plugin Messages

const createRectangles = (count) => {
  parent.postMessage({ pluginMessage: { type: 'create-rectangles', count } }, '*')
}

const closePlugin = () => {
  parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
}

const notify = (message) => {
  parent.postMessage({ pluginMessage: { type: 'msg', message } }, '*')
}

export { createRectangles, closePlugin, notify }