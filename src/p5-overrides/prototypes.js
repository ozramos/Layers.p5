export default function () {
  /**
   * setAttributes
   * - Restores attributes to the canvas, especially in reactive environments like Vue/React
   */
  const _resetContext = globalThis.p5.RendererGL.prototype._resetContext
  
  globalThis.p5.RendererGL.prototype._resetContext = function (options, callback) {
    let pg = this._pInst
    let parent = pg.elt.parentNode
    let prevElt = pg.elt.previousElementSibling
    let nextElt = pg.elt.nextElementSibling
    
    // backup attributes
    const attributes = {}
    pg.elt.getAttributeNames().forEach(key => {
      attributes[key] = pg.elt.getAttribute(key)
    })
    
    // Run original
    _resetContext.call(this, [options, callback])
    pg = this._pInst

    // Restore attributes
    Object.keys(attributes).forEach(key => {
      pg.elt.setAttribute(key, attributes[key])
    })

    // Place back into the DOM
    if (prevElt) {
      prevElt.before(pg.elt)
    } else if (nextElt) {
      nextElt.after(pg.elt)
    } else if (parent) {
      parent.appendChild(pg.elt)
    } else {
      document.body.appendChild(pg.elt)
    }
  }
}