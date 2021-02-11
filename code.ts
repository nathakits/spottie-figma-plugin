// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 450, height: 600 });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'create-image') {
    const nodes: SceneNode[] = [];
    // get current selection
    var currentSel = figma.currentPage.selection
    // if selection has an object
    if (currentSel.length === 1) {
      // loop nodes to check type
      currentSel.forEach(node => {
        if (
          node.type === 'FRAME' ||
          node.type === 'ELLIPSE' ||
          node.type === 'POLYGON' ||
          node.type === 'RECTANGLE' ||
          node.type === 'STAR' ||
          node.type === 'VECTOR'
        ) {
          // inset fill to node
          var buffer = msg.buffer
          var hash = figma.createImage(buffer).hash
          node.fills = [
            { type: 'IMAGE', scaleMode: 'FILL', imageHash: hash }
          ];
        }
        else {
          figma.notify(`Please select a fillable object`)
        }
      });
    } 
    // else create a new rectangle and add to page
    else if (currentSel.length === 0) {
      // image
      var buffer = msg.buffer
      var hash = figma.createImage(buffer).hash
      // viewport
      var viewport = figma.viewport.center
      // create rectangle and set image fill
      const rect = figma.createRectangle();
      // set x and y coordinates with viewport values
      rect.x = viewport.x
      rect.y = viewport.y
      // hard code rect size
      rect.resize(800, 800)
      // set type to IMAGE and set fill with image hash data
      rect.fills = [
        { type: 'IMAGE', scaleMode: 'FILL', imageHash: hash }
      ];
      // add image to Figma
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }
    // notify user
    else {
      figma.notify(`Please select one object`)
    }
  }
};
