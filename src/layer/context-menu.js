import '../styles.js'

function onChange (key) {
  this.menu[key].reset && this.setup && this.setup()
  this.noLoop && this.draw()
  Layers.updateFilters(this)
}

/**
 * Shows the context menu for the Moar
 */
export default {
  /**
   * Checks if things are under the mouse
   */
  checkThingsContextMenu (ev) {
    let bounds = this.canvas.canvas.getBoundingClientRect()
    let x = this.x + bounds.x
    let y = this.y + bounds.y
    let found = false

    this.things.every(thing => {
      if (thing.isWithinThing(ev.x - x, ev.y - y)) {
        thing.showContextMenu(ev, this.$menu)
        found = true
      }
      return !found
    })
  },
  
  /**
   * Displays the clicked layer's menu, along with the other layers' menus as a context menu
   */
  showContextMenu (ev) {
    Layers.closeMenus(ev)
    this._showContextMenuEvent = ev
    this._hasDraggedMenu = false

    if (!this.$menu){
      this.$menu = new globalThis.Tweakpane.Pane()
      this.$menu.registerPlugin(globalThis.TweakpaneEssentialsPlugin)
      this.$menu.$folder = {}
      Layers.openMenus.push(this)

      // General settings
      const general = this.$menu.$folder.general = this.$menu.addFolder({
        title: `Layer: ${this.id}`,
        expanded: true
      })

      // More settings
      if (this.menu) {
        Object.keys(this.menu).forEach(key => {
          const menu = this.menu[key]

          const maybeBindControlToLayer = () => {
            // Check if currently binding
            if (Layers.isBindingMIDI && !Layers.curBindingProp) {
              Layers.curBindingProp = key
              Layers.maybeBindControlToLayer()
              setTimeout(() => {
                this.showContextMenu(ev)
              }, 0)
            }
          }

          // Actually add the setting
          switch (menu.type) {
            case 'slider':
              // Due to a bug with Tweakpane we need to set initial value to number/string
              // @see https://github.com/cocopon/tweakpane/issues/376
              let origValue
              if (this.menu[key]._options) {
                origValue = this.store[key]
               this.store[key] = this.store[key + '__index']
              }
        
              general.addInput(this.store, key, {
                min: typeof menu.min === 'function' ? menu.min() : menu.min,
                max: typeof menu.max === 'function' ? menu.max() : menu.max,
                step: typeof menu.step === 'function' ? menu.step() : menu.step,
              }).on('change', ev => {
                  // Set correct value
                  if (menu._options && Array.isArray(menu._options)) {
                    const keys = Object.keys(menu._options)
                    this.store[key + '__index'] = ev.value
                    this.store[key] = menu._options[keys[ev.value]]
                  }
                  
                  menu.onChange.call(this, ev)
                  maybeBindControlToLayer()
                })
                .on('change', () => onChange.call(this, key))
                .on('change', () => {
                  // Reset on change
                  if (menu.resetOnChange) {
                    this.reset()
                  }
                })
                .on('click', ev => {
                  maybeBindControlToLayer()
                })

                // Restore value
                if (typeof origValue !== 'undefined') {
                  this.store[key] = origValue
                }
            break

            case 'list':
              // Due to a bug with Tweakpane we need to set initial value to number/string
              // @see https://github.com/cocopon/tweakpane/issues/376
              const origVal = this.store[key]
              this.store[key] = 0
              general.addInput(this.store, key, {options: menu.options})
                .on('change', () => onChange.call(this, key))
                .on('change', () => {
                  // Reset on change
                  if (menu.resetOnChange) {
                    this.reset()
                  }
                })

              this.store[key] = origVal
            break
          }
        })
      }
      if (typeof this.onMenu === 'function') {
        this.onMenu.call(this, {
          general
        })
      }

      // Regenerate
      general.addBlade({
        view: 'buttongrid',
        size: [2, 1],
        cells: (x, y) => ({
          title: [
            ['Regenerate All', 'Regenerate Current']
          ][y][x]
        }),
      }).on('click', (ev) => {
        switch (ev.index[0]) {
          // Regenerate all layers
          case 0:
            Layers.trigger('resize', this.stack)
          break
          // Regenerate layer
          case 1:
            this.listeners.menu.regenerate.call(this, ev)
            Layers.updateFilters(this)
          break
        }
      })

      // Global settings
      if (typeof Layers.hooks.globalSettings === 'function') {
        const global = this.$menu.$folder.global = general.addFolder({
          title: 'Global Settings',
          expanded: true
        })
        
        Layers.hooks.globalSettings({
          general,
          global
        })
      }

      // Layer toggle
      const layerToggle = this.$menu.$folder.layerToggle = this.$menu.addFolder({
        title: 'Toggle Layers',
        expanded: false
      })

      // Generate toggles
      const layerVisibility = {}
      const layers = []
      Layers.forEach(layer => layers.push(layer))
      
      layers.reverse().forEach(layer => {
        layerVisibility[layer.id] = !layer.disabled
        layerToggle.addInput(layerVisibility, String(layer.id))
          .on('change', () => {
            layer.toggle()
          })
      })

      // Explode button
      layerToggle.addSeparator()
      layerToggle.addInput(Layers.areLayersExploded, 'Visualize layers in 3D')
      .on('change', (ev) => {
        Layers.explodeLayers(ev.value)
      })

      // MIDI
      this.addMIDIButtons(ev, general, layerToggle)

      // Save
      const save = this.$menu.$folder.save = this.$menu.addFolder({
        title: '💾 Save',
        expanded: false
      })
      const buttons = ['PNG', 'JPG']
      save.addBlade({
        view: 'buttongrid',
        size: [2, 1],
        cells: (x, y) => ({
          title: buttons[y * 2 + x], value: buttons[y * 2 + x]
        }),
      }).on('click', (ev) => {
        if (ev.index[0] === 0 && ev.index[1] === 0) {
          Layers.download('png')
        } else if (ev.index[0] === 1 && ev.index[1] === 0) {
          Layers.download('jpg')
        }
      })

      // Record video
      const record = this.$menu.$folder.record = this.$menu.addFolder({
        title: '🎥 Record video/GIF',
        expanded: false
      })
      record.addInput(Layers.record, 'format', {
        options: {
          WebM: 'webm',
          GIF: 'gif',
          MP4: 'mp4',
          PNG: 'png',
          JPG: 'jpg',
          WebP: 'webp' 
        }
      })
      record.addInput(Layers.record, 'numFrames')
      record.addInput(Layers.record, 'bitrate', {
        label: 'bitrade (mp4)'
      })
      record.addInput(Layers.record, 'quality', {min: 0, max: 1, step: .05})

      Layers.record.width = this.width
      Layers.record.height = this.height
      record.addInput(Layers.record, 'width')
      record.addInput(Layers.record, 'height')
      
      record.addButton({title: 'Record'}).on('click', () => {
        Layers.startRecording()
      })

      // Update filter layers above this layer
      // Persist data to localstorage
      this.$menu.on('change', () => {
        // Store menu states
        Layers.sessionData = {}
        Layers.forEach(layer => {
          Layers.sessionData[layer.id] = {
            disabled: layer.disabled
          }
        })
        localStorage.setItem('layers', JSON.stringify(Layers.sessionData))
      })
    }

    // Handle drag
    let origOffset = {x: 0, y: 0}
    const $handle = this.$menu.containerElem_.querySelector('.tp-fldv_b')
    $handle.closest('.tp-dfwv').addEventListener('click', (ev) => {
      // This can be empty when this menu is regenerated
      if (this.$menu) {
        this.$menu.$folder.general.disabled = false
        this._hasDraggedMenu = false
      }
    })
    $handle.addEventListener('mousedown', (ev) => {
      const bounds = this.$menu.containerElem_.getBoundingClientRect()
      origOffset.x = ev.x - bounds.x
      origOffset.y = ev.y - bounds.y
    })
    $handle.addEventListener('mouseup', (ev) => {
      if (this._hasDraggedMenu){
        this._hasDraggedMenu = false
        globalThis.$handle = $handle
        $handle.dispatchEvent(new MouseEvent('mouseup'))
        return
      }
    })
    $handle.addEventListener('mousemove', (ev) => {
      if (mouseIsPressed) {
        this.$menu.$folder.general.disabled = true
        this._hasDraggedMenu = true
      }
    })
    $handle.closest('.tp-dfwv').addEventListener('mousemove', (ev) => {
      if (this._hasDraggedMenu) {
        this.$menu.containerElem_.style.left = `${ev.x - origOffset.x}px`
        this.$menu.containerElem_.style.top = `${ev.y - origOffset.y}px`
      }
    })
    
    // Move the menu to the mouse position
    const bounds = this.$menu.containerElem_.getBoundingClientRect()
    this.$menu.containerElem_.style.position = 'fixed'
    if (ev.x + bounds.width > width + globalThis.innerWidth) {
      this.$menu.containerElem_.style.left = (width + globalThis.innerWidth - bounds.width) + 'px'
    } else {
      this.$menu.containerElem_.style.left = ev.x + 'px'
    }
    if (ev.y + bounds.height > height + globalThis.innerHeight) {
      this.$menu.containerElem_.style.top = (height + globalThis.innerHeight - bounds.height) + 'px'
    } else {
      this.$menu.containerElem_.style.top = ev.y + 'px'
    }
  },
  

  /**
   * Goes through the menu object and sets defaults
   * - Also sets a default .store value
   */
  parseMenu () {
    if (!this.menu) return

    Object.keys(this.menu).forEach(key => {
      let menu = this.menu[key]

      // Extract values from functions
      if (typeof menu === 'function') {
        menu = menu.call(this)
      }

      // Convert arrays
      if (Array.isArray(menu)) {
        const opts = [...menu]
        menu = {
          type: 'list',
          options: opts
        }
      }
      // Add type to missing objects
      if (!menu.type && Array.isArray(menu.options)) {
        menu.type = 'list'
      }
      // Convert list into objects
      if (menu?.type === 'list' && Array.isArray(menu.options)) {
        const opts = {}
        menu.options.forEach((item, key) => {
          opts[key] = item
        })
        menu.options = opts
      }

      // Objects without a type
      if (typeof menu === 'object' && !menu.type) {
        menu.type = 'slider'
      }
      // Convert slider with options to slider with values
      if (menu.type === 'slider' && menu.options) {
        menu.min = 0
        menu.max = Object.keys(menu.options).length-1
        menu.step = 1
        menu._options = menu.options
        delete menu.options
      }

      switch (menu.type) {
        case 'slider':
          Object.assign(menu, {
            min: menu.min || 0,
            max: menu.max || 1,
            type: 'slider',
          })
          if (!menu.onChange) {
            menu.onChange = function () {
              this.noLoop && this.draw()
            }
          }
          
          if (menu.step) {
            menu.step = menu.step
          } else if (menu.max > 1) {
            menu.step = 1
          } else {
            menu.step = 0.001
          }
    
          // Add the item to the store if it doesn't exist
          if (!(key in this.store)) {
            const min = typeof menu.min === 'function' ? menu.min() : menu.min
            const max = typeof menu.max === 'function' ? menu.max() : menu.max
            const step = typeof menu.step === 'function' ? menu.step() : menu.step
            this.store[key] = ('default' in menu) ? menu.default : stepRound(random(min, max), step, min)

            // Use correct value if it's an array and store index
            if (menu._options && Array.isArray(menu._options)) {
              this.store[key + '__index'] = this.store[key]
              this.store[key] = menu._options[this.store[key]]
            }
          }
        break

        case 'list':
          // Add item to store if it doesn't exist
          if (!(key in this.store)) {
            this.store[key] = ('default' in menu) ? menu.options[menu.default] : menu.options[~~random(Object.keys(menu.options).length)]
          }
        break
      }

      this.menu[key] = menu
    })
  }
}