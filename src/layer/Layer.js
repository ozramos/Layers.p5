import contextMenu from './context-menu.js'
import p5Overrides from '../p5-overrides/list.js'
import applyP5Overrides from '../p5-overrides/methods.js'
import midiMenu from './midi-menu.js'

export default class Layer {
  constructor (opts = {}) {
    this.maybeInit(opts)
  }

  // Wait until p5 is ready
  maybeInit (opts) {
    if (typeof globalThis.P2D === 'undefined') {
      setTimeout(() => this.maybeInit(opts), 0)
    } else {
      this.init(opts)
    }
  }
  init (opts) {
    // Methods
    // @todo Let's clean this up
    this.showContextMenu = contextMenu.showContextMenu
    this.parseMenu = contextMenu.parseMenu
    this.checkThingsContextMenu = contextMenu.checkThingsContextMenu
    this.addMIDIButtons = midiMenu.addMIDIButtons
    this.connectMIDI = midiMenu.connectMIDI
    
    // Default dimensions: parent size or fullscreen
    let w = Layers.target?.clientWidth || opts.target?.clientWidth || globalThis.width
    let h = Layers.target?.clientHeight || opts.target?.clientWidth || globalThis.height

    // Last moved target
    this._hasMovedTarget = null
    this.requestAnimationFrameID = null

    // things
    this.curThingId = 0

    // Defaults
    this.opts = globalThis.defaults(opts, {
      id: Layers.curId,
      disabled: false,
      menuDisabled: false,
      type: 'layer',
      target: Layers.target || null,
      stack: Layers.curStack || null,
      renderer: P2D,
      offscreenRenderer: opts.offscreenRenderer || P2D,
      
      fps: 30,
      noLoop: false,
      // 0 for system default
      pixelDensity: 0,
      frameCount: 0,

      // Things
      things: [],

      // Dependencies
      waitFor: null,

      // Dimensions
      width: w,
      height: h,
      x: 0,
      y: 0,

      // Canvas
      canvas: null,
      offscreen: null,
      colors: Layers.default.colors,
      colorMode: Layers.default.colorMode,

      // Listeners
      onClick: null,
      beforeGenerate: null,
      afterGenerate: null,
      onDispose: null,
      
      // Custom methods
      methods: {},

      // Custom store
      store: {},
      menu: {}
    })

    // Setup canvas
    this.generate()

    // Apply session data
    if (Layers.sessionData && this.id in Layers.sessionData) {
      this.disabled = Layers.sessionData[this.id].disabled
    }
    
    // Store references
    // Generate unique ID
    const origId = this.id
    Layers.curId++
    
    if (Layers[origId]) {
      this.id = origId.toString() + '_' + Layers.curId
    }
    // Store by stack
    if (!Layers.stack[this.stack]) {
      Layers.stack[this.stack] = {}
    }
    Layers.stack[this.stack][origId] = this
    // Update Layers getter to pick the correct reference
    if (!Layers[origId]) {
      Object.defineProperty(Layers, origId, {
        get: () => {
          return Layers.stack[Layers.curStack]?.[origId]
        }
      })
    }

    // Methods
    Object.keys(this.opts.methods).forEach(key => {
      if (this[key]) {
        console.error('Trying to create method "' + key + '" but it already exists in the Layer as a property or method.')
      } else {
        this[key] = this.opts.methods[key]
      }
    })

    this.callSetup()

    // Add a slight delay to draw to allow other setups() to finish
    // Add an extra delay to filters to allow for faster render on load
    if (this.type === 'filter' && !this.disabled) {
      Layers.mergeLayers(this)
      this.draw()
    } else if (!this.disabled) {
      this.draw()
    }
  }

  /**
   * Sets up or restores the layer to its default state
   */
  generate (callSetup) {
    // @fixme clean this up
    // Aliases
    if (!this.id) this.id = this.opts.id
    if (!this.canvas) this.canvas = this.opts.canvas
    if (!this.offscreen) this.offscreen = this.opts.offscreen
    if (!this.x) this.x = this.opts.x
    if (!this.y) this.y = this.opts.y
    if (!this.width) this.width = this.opts.width
    if (!this.height) this.height = this.opts.height
    if (!this.disabled) this.disabled = this.opts.disabled
    if (!this.menuDisabled) this.menuDisabled = this.opts.menuDisabled
    if (!this.colors) this.colors = this.opts.colors
    if (!this.colorMode) this.colorMode = this.opts.colorMode
    if (!this.beforeGenerate) this.beforeGenerate = this.opts.beforeGenerate
    if (!this.afterGenerate) this.afterGenerate = this.opts.afterGenerate
    if (!this.onDispose) this.onDispose = this.opts.onDispose
    if (!this.setup) this.setup = this.opts.setup
    if (!this.type) this.type = this.opts.type
    if (!this.pixelDensity) {
      this.pixelDensity = this.opts.pixelDensity || 1
    }
    if (!this.fps) this.fps = this.opts.fps
    if (!this.target) this.target = this.opts.target
    if (!this.renderer) this.renderer = this.opts.renderer
    if (!this.offscreenRenderer) this.offscreenRenderer = this.opts.offscreenRenderer
    if (!this.waitFor) this.waitFor = this.opts.waitFor
    if (!this.stack) this.stack = this.opts.stack
    if (!this.things) this.things = this.opts.things

    // Always reset
    this.noLoop = this.opts.noLoop

    // Canvas
    if (!this.canvas) {
      this.canvas = createGraphics(this.width, this.height, this.renderer) // Main layer
    }
    if (!this.offscreen) {
      this.offscreen = createGraphics(this.width, this.height, this.offscreenRenderer) // Buffer for individual things
    }
    if (this.pixelDensity) {
      this.canvas.pixelDensity(this.pixelDensity)
      this.offscreen.pixelDensity(this.pixelDensity)
    }
    this.canvas.elt.classList.add('layersp5-layer', `layersp5-layer-${this.id}`)
    this.offscreen.elt.classList.add('layersp5-offscreen', `layersp5-layer-${this.id}`)
    globalThis.minSize = min(this.width, this.height)
    globalThis.maxSize = max(this.width, this.height)

    // Setup the target to receive the canvases
    if (this.target && !this._hasMovedTarget) {
      this._hasMovedTarget = true
      this.canvas.elt.style.width = '100%'
      this.canvas.elt.style.height = '100%'

      this.target.appendChild(this.canvas.elt)
      this.target.appendChild(this.offscreen.elt)
      
      if (!this.target.style.position) {
        this.target.style.position = 'relative'
      }
    }
    this.canvas.elt.style.position = `absolute`
    this.canvas.elt.style.display = 'block'
    this.canvas.elt.style.left = `${this.x}px`
    this.canvas.elt.style.top = `${this.y}px`
    this.canvas.elt.parentElement.classList.add('layersp5-layers-wrap')

    // Explode with delay so that it gets animated
    setTimeout(() => {
      Layers.toggleExplodeClassForLayerTarget(this, Layers.areLayersExploded['Visualize layers in 3D'])
    }, 0)

    this.canvas.colorMode(...this.colorMode)
    this.offscreen.colorMode(...this.colorMode)
    this.canvas.clear()
    this.offscreen.clear()

    // Throttled functions
    this.throttledDraw = throttle(this.draw.bind(this), 1000/this.opts.fps)

    // Menu
    this.menu = globalThis.clone(this.opts.menu)
    this.store = globalThis.clone(this.opts.store)
    // Add bg color to menu
    if (!this.menu.bg) {
      this.menu.bg = {
        type: 'slider',
        options: this.colors
      }
    }
    this.parseMenu()
    
    this.beforeGenerate && this.beforeGenerate()

    // Misc
    this.frameCount = 0
    
    // Setup
    if (this.setup && !this._hasSetContextOnSetup) {
      this._hasSetContextOnSetup = true
      const _setup = this.setup
      this.setup = function () {
        this.useGlobalContext()
        _setup.call(this, this.canvas, this.offscreen)
        this.restoreGlobalContext()
      }
    }
    callSetup && this.callSetup()
    
    this.afterGenerate && this.afterGenerate()
  }

  /**
   * Calls the setup method if it exists
   * - Temporarily changes the _renderer target
   */
  callSetup () {
    // Call the setup
    this.setup && this.setup.call(this, this.offscreen)
  }

  /**
   * Toggle the layer on/off
   */
  disable () {this.hide()}
  hide () {
    this.disabled = true
    this.canvas.elt.style.display = 'none'
  }
  enable () {this.show()}
  show () {
    this.disabled = false
    this.canvas.elt.style.display = 'block'
    this.draw()
  }
  toggle () {
    if (this.disabled) this.show()
    else this.hide()
  }
  
  /**
   * Trigger an event
   */
  trigger (evName) {
    switch (evName) {
      case 'resize':
        this.resize()
      break
    }
  }

  /**
   * Reset the sketch with current store
   */
  reset () {
    this.setup()
  }
  
  /**
   * Resize the canvas
   */
  resize () {
    const $target = this.target || document.body
    const width = $target.clientWidth
    const height = $target.clientHeight
    this.width = width
    this.height = height
    this.canvas.resizeCanvas(width, height)
    this.offscreen.resizeCanvas(width, height)

    this.generate(true)

    if (this.type === 'filter' && !this.disabled) {
      Layers.mergeLayers(this)
      this.noLoop && this.draw()
    } else if (!this.disabled) {
      this.noLoop && this.draw()
    }
  }

  /**
   * Draw loop
   * @param skipLoop Set to true to skip the loop (like when recording)
   */
  draw (skipLoop) {
    cancelAnimationFrame(this.requestAnimationFrameID)
    
    if (!this.disabled) {
      // Update position
      if (!this._lastX !== this.x || !this._lastY !== this.y) {
        this.canvas.elt.style.left = `${this.x}px`
        this.canvas.elt.style.top = `${this.y}px`
      }

      // Draw
      this.useGlobalContext()
      this.opts.draw && this.opts.draw.call(this, this.offscreen)
      this.things.forEach(thing => {
        if (!thing.autodraw) return
        
        if (!thing.hidden && thing.scale.size < 1) {
          thing.scale.size += thing.scale.growRate
        }
        
        thing.autodraw && thing.draw()
      })
      this.restoreGlobalContext()
      this.frameCount++
  
      this._lastX = this.x
      this._lastY = this.y
    }

    // Loop drawing
    this.requestAnimationFrameID = requestAnimationFrame(() => !Layers.noLoop && !this.noLoop && this.draw())
  }

  /**
   * Updates the global context so that all renders happen on current layer
   * (eg rect, circle, etc without having to type canvas.rect())
   */
  useGlobalContext () {
    if (Layers._globalContextLayer === this.id) return
    // Layers updates
    Layers._globalContextLayer = this.id
    Layers.curStack = this.stack

    // Save the current context
    this._context = {}
    this._storeContext = {}
    p5Overrides.forEach(key => {
      this._context[key] = window[key]
      window[key] = key === 'canvas' ? this.canvas.elt : this.canvas[key]
    })

    // Manual overrides
    applyP5Overrides.call(this)

    // Helpers
    globalThis.minSize = min(this.canvas.width, this.canvas.height)
    globalThis.maxSize = max(this.canvas.width, this.canvas.height)

    // Add this.$ variables
    Object.keys(this.store).forEach(key => {
      if (window[`$${key}`]) {
        console.warn(window[`$${key}`], `$${key} is already defined and cannot be used as a store key for Layer: ${this.id}`)
      } else {
        window[`$${key}`] = this.store[key]
        this._storeContext[key] = true
      }
    })
  }
  restoreGlobalContext () {
    Layers._globalContextLayer = null

    p5Overrides.forEach(key => {
      window[key] = this._context[key]
    })

    // Remove this.$ variables
    Object.keys(this._storeContext).forEach(key => {
      this.store[key] = window[`$${key}`]
      delete window[`$${key}`]
    })
  }

  /**
   * Add a new thing to this Moar
   * @param {*} x 
   * @param {*} y 
   * @param {*} size
   * @param {*} params 
   */
   // @todo make this a plugin
  addEye (x, y, size, params) {
    if (typeof x === 'object') {
      params = x
      x = params.x
      y = params.y
      size = params.size      
      
      delete x.x
      delete x.y
      delete x.size
    }
    
    const thing = new Thing.Eye(this, x, y, size, Object.assign({}, params))
    this.things.push(thing)
    return thing
  }

  /**
   * Free memory and delete reference from Layers
   */
  dispose () {
    globalThis.cancelAnimationFrame(this.requestAnimationFrameID)
    this.requestAnimationFrameID = null
    this.onDispose && this.onDispose()
    this.canvas.remove()
    this.offscreen.remove()

    // Delete from stack
    delete Layers.stack[this.stack][this.opts.id]
  }

  /**
   * Uses frameCount to return the progress within a loop of the passed number of seconds
   * @param {*} seconds 
   * @returns 
   */
  getProgress (seconds = 4) {
    const period = +this.fps * seconds / 2
    return (this.frameCount % period) / period
  }

  /**
   * Core Event listeners
   */
  listeners = {
    menu: {
      regenerate: ev => {
        // this.noLoop always gets reset to initial state, so we remember what it was
        // before generate and use that to determine if we should redraw or not
        const _noLoop = this.noLoop
        this.generate(true)
        _noLoop && this.draw(true)
        this._showContextMenuEvent && this.showContextMenu(this._showContextMenuEvent)
        this._showContextMenuEvent = null
      }
    }
  }
}