/**
 * Represents a Moar thing
 * 
 * @param {Number} x - The x position of the eye
 * @param {Number} y - The y position of the eye
 * @param {Number} size - The size of the eye
 */
export default class ThingEye {
  constructor(layer, x, y, size, params = {}) {
    this.layer = layer
    this.layer.things.push(this)
    this.clones = []
    
    // @todo Rename to .opts and use similar system as Layer
    this.params = defaults(params, {
      angle: 0,
      autodraw: true,
      id: this.layer.curThingId,

      // @todo pass a string and expand to object
      iris: {
        color: floor(random(this.layer.colors.length-1))
      },

      pupil: {
        size: random(0.2, 0.8),
        color: '#00193c',
        shape: 'random',
        possibleShapes: ['circle', 'vert', 'horiz', 'rect']
      },

      eyeWhites: null,

      shape: 'almond',
      possibleShapes: ['almond', 'circle'],

      store: {},

      blink: {
        auto: true,
        len: 8,
        redEye: true,
        maxWait: 600,
        lookWait: 120
      },

      // Look
      look: {
        mode: 'auto',
        x,
        y,
        r: function () {return random(.3, .8)}
      },

      // A percentage of how closed the eyelid is
      eyelid: {
        top: 0,
        bottom: 0,
      },

      // Shifts - this is so that variations can be added without affecting other calculations
      scale: {
        size: 1,
        angle: 0,
        // The speed that the resident grows per frame
        growRate: 0.01
      },

      // Body
      possibleBodyTypes: ['', 'triangle', 'rect', 'pentagon', 'star', 'heart'],
      body: '',
      bg: {},

      // Misc states
      hidden: false,
      // Show the context menu
      menu: true,

      // Callbacks
      onBlink: null,
      onClick: null
    })

    // Convert functions to values
    ;['angle'].forEach(prop => {
      if (typeof getProp(this.params, prop) === 'function') {
        setProp(this.params, prop, this.params.angle.apply(this))
      }
    })
    
    this.x = x
    this.y = y
    this.angle = this.params.angle
    this.size = size || minSize * .5
    this.scale = this.params.scale
    this.canvas = this.params.canvas || this.layer.canvas
    this.autodraw = this.params.autodraw
    this.id = this.params.id
    this.layer.curThingId++

    // Shape
    this.shape = this.params.shape
    if (this.shape === 'random') {
      this.shape = this.params.possibleShapes[floor(random(this.params.possibleShapes.length))]
    }
    this.possibleShapes = this.params.possibleShapes
    
    // pupil
    this.pupil = {
      size: this.params.pupil.size,
      color: this.params.pupil.color,
      shape: this.params.pupil.shape,
      possibleShapes: this.params.pupil.possibleShapes,
    }
    if (this.pupil.shape === 'random') {
      this.pupil.shape = random(this.pupil.possibleShapes)
    }
    
    this.iris = {
      color: this.params.iris.color
    }
    
    this.eyeWhites = this.params.eyeWhites

    this.redEye = 0
    this.hidden = this.params.hidden
    this.store = this.params.store

    // Blink
    this.blink = this.params.blink
    this.isBlinking = false
    this.blinkTimer = random(this.blink.maxWait + this.layer.things.length * 30)
    this.curBlink = 0

    // Look
    this.look = {
      mode: this.params.look.mode,
      x: this.params.look.x,
      y: this.params.look.y,
      r: this.params.look.r,
      angle: this.params.look.angle || 0,
      timer: random(this.blink.lookWait)
    }
    this.updateLook(this.look.x, this.look.y)
    
    this.eyelid = this.params.eyelid

    // Features
    this.eyeOffset = {x: 0, y: 0}
    this.sizeScale = 1
    this.bg = this.params.bg

    // Physics
    this.physics = {
      body: {
        angle: this.angle + this.scale.angle,
        position: {x, y}
      }
    }

    // Callbacks
    this.onBlink = this.params.onBlink

    // Context menu
    this.$menu = null

    // Body
    this.resetFeatures(this.params)
  }

  /**
  * Reset the eye features
  */
  resetFeatures (features = {}) {
    this.params = defaults(this.params, features)
    
    // Clone properties
    if (this.cloned) {
      const ingoredProps = ['x', 'y', 'menu', 'angle']
      
      for (const prop in this.cloned) {
        if (!ingoredProps.includes(prop)) {
          this[prop] = this.cloned[prop]
        }
      }

      return
    }

    this.eyeOffset = {x: 0, y: 0}
    this.sizeScale = 1

    // Body
    if (this.params.body === 'random') {
      this.params.body = random(this.params.possibleBodyTypes)
    }

    // Eyelashes
    const eyelashDefaults = {
      colorCycleSpeed: 5,
      colorCycleCounter: 0,
      colorCycleStep: 0,
      blend: 'hard-light'
    }
    if (typeof this.params.eyelashes === 'string') {
      this.params.eyelashes = {
        type: this.params.eyelashes,
        ...eyelashDefaults
      }
    } else {
      this.params.eyelashes = defaults(this.params.eyelashes, eyelashDefaults)
    }

    this.bg = defaults(this.bg, {
      outer: {
        weight: 0
      },
      inner: {
        weight: 0
      }
    })

    /**
    * Possible background shapes
    */
    switch (this.params.body) {
      /**
      * Triangle
      */
      case 'triangle':
        // Make sure the color is not the same as the background
        this.bg.color = $bg
        while (this.bg.color == $bg) {
          this.bg.color = floor(random(this.layer.colors.length))
        }
        if (random() > 0.5) {
          this.bg.outer.dash = [floor(random(5, this.size * this.scale.size))]
        }
        this.bg.outer.weight = max(2, floor(random(this.size * this.scale.size / 100, this.size * this.scale.size / 40)))

        // Inner triangles
        if (random() > 0.5) {
          this.bg.inner.visible = true
          if (random() > 0.5) {
            this.bg.inner.dash = [floor(random(5, 250))]
          }
          this.bg.inner.weight = max(2, floor(random(this.size * this.scale.size / 60, this.size * this.scale.size / 40)))
        }

        // Fill
        if (random() > 0.65) {
          this.bg.fill = true
        }

        // Eye
        this.sizeScale = .5
        this.eyeOffset.y = this.size * this.scale.size * .25
      break

      /**
      * Rectangle
      */
      case 'rect':
        // Make sure the color is not the same as the background
        this.bg.color = $bg
        while (this.bg.color == $bg) {
          this.bg.color = floor(random(this.layer.colors.length))
        }
        if (random() > 0.5) {
          this.bg.outer.dash = [floor(random(5, this.size * this.scale.size))]
        }
        this.bg.outer.weight = max(2, floor(random(this.size * this.scale.size / 100, this.size * this.scale.size / 40)))

        // Inner rects
        if (random() > 0.5) {
          this.bg.inner.visible = true
          if (random() > 0.5) {
            this.bg.inner.dash = [floor(random(5, this.size * this.scale.size))]
          }
          this.bg.inner.weight = max(2, floor(random(this.size * this.scale.size / 60, this.size * this.scale.size / 40)))
        }

        // Fill
        if (random() > 0.65) {
          this.bg.fill = true
        }

        // Eye
        this.sizeScale = .5
        this.eyeOffset.y = 0
      break

      /**
      * Pentagon
      */
      case 'pentagon':
        // Make sure the color is not the same as the background
        this.bg.color = $bg
        while (this.bg.color == $bg) {
          this.bg.color = floor(random(this.layer.colors.length))
        }
        if (random() > 0.5) {
          this.bg.outer.dash = [floor(random(5, this.size * this.scale.size))]
        }
        this.bg.outer.weight = max(2, floor(random(this.size * this.scale.size / 100, this.size * this.scale.size / 40)))

        // Inner pentagon
        if (random() > 0.5) {
          this.bg.inner.visible = true
          if (random() > 0.5) {
            this.bg.inner.dash = [floor(random(5, this.size * this.scale.size))]
          }
          this.bg.inner.weight = max(2, floor(random(this.size * this.scale.size / 60, this.size * this.scale.size / 40)))
        }

        // Fill
        if (random() > 0.65) {
          this.bg.fill = true
        }

        // Eye
        this.sizeScale = .5
        this.eyeOffset.y = 0
      break

      /**
      * Star
      * @todo Override any of these props
      */
      case 'star':
        // Make sure the color is not the same as the background
        if (typeof this.bg.color === 'undefined') {
          this.bg.color = $bg
          while (this.bg.color == $bg) {
            this.bg.color = floor(random(this.layer.colors.length))
          }
        }
        if (random() > 0.5) {
          this.bg.outer.dash = [floor(random(5, this.size * this.scale.size))]
        }
        this.bg.outer.weight = max(2, floor(random(this.size * this.scale.size / 100, this.size * this.scale.size / 40)))

        // Inner star
        if (random() > 0.5) {
          this.bg.inner.visible = true
          if (random() > 0.5) {
            this.bg.inner.dash = [floor(random(5, this.size * this.scale.size))]
          }
          this.bg.inner.weight = max(2, floor(random(this.size * this.scale.size / 60, this.size * this.scale.size / 40)))
        }

        // Fill
        if (typeof this.bg.fill === 'undefined') {
          if (random() > 0.65) {
            this.bg.fill = true
          }
        }

        // Eye
        this.sizeScale = .5
        this.eyeOffset.y = 0
      break

      /**
      * Heart
      */
      case 'heart':
        // Make sure the color is not the same as the background
        if (typeof this.bg.color === 'undefined') {
          this.bg.color = $bg
          while (this.bg.color == $bg) {
            this.bg.color = floor(random(this.layer.colors.length))
          }
        }
          
        if (random() > 0.5) {
          this.bg.outer.dash = [floor(random(5, this.size * this.scale.size / 10))]
        }
        this.bg.outer.weight = max(2, floor(random(this.size * this.scale.size / 100, this.size * this.scale.size / 40)))

        // Inner triangles
        if (random() > 0.5) {
          this.bg.inner.visible = true
          if (random() > 0.5) {
            this.bg.inner.dash = [floor(random(5, this.size * this.scale.size / 10))]
          }
          this.bg.inner.weight = max(2, floor(random(this.size * this.scale.size / 60, this.size * this.scale.size / 40)))
        }

        // Fill
        if (typeof this.bg.fill === 'undefined') {
          if (random() > 0.65) {
            this.bg.fill = true
          }
        }

        // Eye
        this.sizeScale = .5
        this.eyeOffset.y = 0
      break
    }

    // Eye squint
    if (!this.eyelid.top) {
      if (random() > 0.5) {
        this.eyelid.top = random(.25, 1)
      } else {
        this.eyelid.top = 1
      }
    }
    if (!this.eyelid.bottom) {
      if (random() > 0.5) {
        this.eyelid.bottom = random(.25, 1)
      } else {
        this.eyelid.bottom = 1
      }
    }
  }

  /**
  * Update the shape
  */
  draw () {
    if (this.hidden || this.scale.size < 0) return

    this.canvas.noStroke()
    this.layer.offscreen.clear()
    this.layer.offscreen.noStroke()
    this.layer.offscreen.push()
    this.layer.offscreen.translate(this.x, this.y)
    this.redEye -= 2
    this.redEye = max(0, this.redEye)

    // Before draw hook
    this.params.beforeDraw && this.params.beforeDraw(this, this.canvas)

    /**
    * Draw the background
    */
    switch (this.params.body) {
      /**
      * Triangle
      */
      case 'triangle':
        this.canvas.push()
        this.canvas.noFill()

        // Outer
        this.canvas.stroke(this.layer.colors[this.bg.color])
        this.canvas.strokeWeight(this.bg.outer.weight)
        this.bg.outer.dash && this.canvas.drawingContext.setLineDash(this.bg.outer.dash)
        this.canvas.triangle(
          this.x - this.size * this.scale.size / 2, this.y + this.size * this.scale.size / 2,
          this.x + this.size * this.scale.size / 2, this.y + this.size * this.scale.size / 2,
          this.x, this.y - this.size * this.scale.size / 2
        )
        this.canvas.drawingContext.setLineDash([])

        // inner
        if (this.bg.inner) {
          this.canvas.stroke(this.layer.colors[this.bg.color])

          this.bg.inner.dash && this.canvas.drawingContext.setLineDash(this.bg.inner.dash)
          this.canvas.strokeWeight(this.bg.inner.weight)
          this.canvas.triangle(
            this.x - this.size * this.scale.size / 2 + this.size * this.scale.size / 2 * .1, this.y + this.size * this.scale.size / 2 - this.size * this.scale.size / 2 * .065,
            this.x + this.size * this.scale.size / 2 - this.size * this.scale.size / 2 * .1, this.y + this.size * this.scale.size / 2 - this.size * this.scale.size / 2 * .065,
            this.x, this.y - this.size * this.scale.size / 2 + this.size * this.scale.size / 2 * .15
          )
          this.bg.inner.dash && this.canvas.drawingContext.setLineDash(this.bg.inner.dash)
        }

        // fill
        if (this.bg.fill) {
          this.canvas.noStroke()
          this.canvas.fill(this.layer.colors[this.bg.color])
          this.canvas.triangle(
            this.x - this.size * this.scale.size / 2 + this.size * this.scale.size / 2 * .2, this.y + this.size * this.scale.size / 2 - this.size * this.scale.size / 2 * .125,
            this.x + this.size * this.scale.size / 2 - this.size * this.scale.size / 2 * .2, this.y + this.size * this.scale.size / 2 - this.size * this.scale.size / 2 * .125,
            this.x, this.y - this.size * this.scale.size / 2 + this.size * this.scale.size / 2 * .275
          )
          this.bg.inner.dash && this.canvas.drawingContext.setLineDash(this.bg.inner.dash)
        }
        this.canvas.pop()
      break

      /**
      * Rectangle
      */
      case 'rect':
        this.canvas.push()
        this.canvas.noFill()

        // Outer
        this.canvas.stroke(this.layer.colors[this.bg.color])
        this.canvas.strokeWeight(this.bg.outer.weight)
        this.bg.outer.dash && this.canvas.drawingContext.setLineDash(this.bg.outer.dash)
        this.canvas.rect(
          this.x - this.size * this.scale.size / 2, this.y - this.size * this.scale.size / 2,
          this.size * this.scale.size, this.size * this.scale.size
        )
        this.canvas.drawingContext.setLineDash([])

        // inner
        if (this.bg.inner) {
          this.canvas.stroke(this.layer.colors[this.bg.color])

          this.bg.inner.dash && this.canvas.drawingContext.setLineDash(this.bg.inner.dash)
          this.canvas.strokeWeight(this.bg.inner.weight)
          this.canvas.rect(
            this.x - this.size * this.scale.size / 2 * .9, this.y - this.size * this.scale.size / 2 * .9,
            this.size * this.scale.size * .9, this.size * this.scale.size * .9
          )
        }

        // fill
        if (this.bg.fill) {
          this.canvas.noStroke()
          this.canvas.fill(this.layer.colors[this.bg.color])
          this.canvas.rect(
            this.x - this.size * this.scale.size / 2 * .8, this.y - this.size * this.scale.size / 2 * .8,
            this.size * this.scale.size * .8, this.size * this.scale.size * .8
          )
        }
        this.canvas.pop()
      break

      /**
      * Pentagon
      */
      case 'pentagon':
        this.canvas.push()
        this.canvas.noFill()

        // Outer
        this.canvas.stroke(this.layer.colors[this.bg.color])
        this.canvas.strokeWeight(this.bg.outer.weight)
        this.bg.outer.dash && this.canvas.drawingContext.setLineDash(this.bg.outer.dash)
        this.canvas.push()
        this.canvas.translate(this.x, this.y)
        this.canvas.rotate(radians(-18))
        Shapes.polygon(this.canvas, 0, 0, this.size * this.scale.size * .7, 5)
        this.canvas.pop()
        this.canvas.drawingContext.setLineDash([])

        // inner
        if (this.bg.inner) {
          this.canvas.stroke(this.layer.colors[this.bg.color])

          this.bg.inner.dash && this.canvas.drawingContext.setLineDash(this.bg.inner.dash)
          this.canvas.strokeWeight(this.bg.inner.weight)
          this.canvas.push()
          this.canvas.translate(this.x, this.y)
          this.canvas.rotate(radians(-18))
          Shapes.polygon(this.canvas, 0, 0, this.size * this.scale.size * .63, 5)
          this.canvas.pop()
        }

        // fill
        if (this.bg.fill) {
          this.canvas.noStroke()
          this.canvas.fill(this.layer.colors[this.bg.color])
          this.canvas.push()
          this.canvas.translate(this.x, this.y)
          this.canvas.rotate(radians(-18))
          Shapes.polygon(this.canvas, 0, 0, this.size * this.scale.size * .58, 5)
          this.canvas.pop()
        }
        this.canvas.pop()
      break

      /**
      * Star
      */
      case 'star':
        this.canvas.push()
        this.canvas.noFill()

        // Outer
        this.canvas.stroke(this.layer.colors[this.bg.color])
        this.canvas.strokeWeight(this.bg.outer.weight)
        this.bg.outer.dash && this.canvas.drawingContext.setLineDash(this.bg.outer.dash)
        this.canvas.push()
        this.canvas.translate(this.x, this.y)
        this.canvas.rotate(radians(17))
        Shapes.star(this.canvas, 0, 0, this.size * this.scale.size * .7, this.size * this.scale.size * .45, 5)
        this.canvas.pop()
        this.canvas.drawingContext.setLineDash([])

        // inner
        if (this.bg.inner) {
          this.canvas.stroke(this.layer.colors[this.bg.color])

          this.bg.inner.dash && this.canvas.drawingContext.setLineDash(this.bg.inner.dash)
          this.canvas.strokeWeight(this.bg.inner.weight)
          this.canvas.push()
          this.canvas.translate(this.x, this.y)
          this.canvas.rotate(radians(17))
          Shapes.star(this.canvas, 0, 0, this.size * this.scale.size * .6, this.size * this.scale.size * .4, 5)
          this.canvas.pop()
        }

        // fill
        if (this.bg.fill) {
          this.canvas.noStroke()
          this.canvas.fill(this.layer.colors[this.bg.color])
          this.canvas.push()
          this.canvas.translate(this.x, this.y)
          this.canvas.rotate(radians(17))
          Shapes.star(this.canvas, 0, 0, this.size * this.scale.size * .55, this.size * this.scale.size * .35, 5)
          this.canvas.pop()
        }
        this.canvas.pop()
      break

      /**
      * Heart
      * @see https://editor.p5js.org/Mithru/sketches/Hk1N1mMQg
      */
      case 'heart':
        this.canvas.push()
        this.canvas.noFill()

        // Outer
        this.canvas.stroke(this.layer.colors[this.bg.color])
        this.canvas.strokeWeight(this.bg.outer.weight)
        this.bg.outer.dash && this.canvas.drawingContext.setLineDash(this.bg.outer.dash)
        this.canvas.push()
        this.canvas.translate(0, -this.size * this.scale.size / 2 + .075 * this.size * this.scale.size)
        this.canvas.beginShape()
        this.canvas.vertex(this.x, this.y + this.size * this.scale.size * .05)
        this.canvas.bezierVertex(
          this.x - this.size * this.scale.size / 2 + this.size * this.scale.size * .1, this.y - this.size * this.scale.size / 2 + this.size * this.scale.size * .05,
          this.x - this.size * this.scale.size + this.size * this.scale.size * .1, this.y + this.size * this.scale.size / 3 + this.size * this.scale.size * .05,
          this.x, this.y + this.size * this.scale.size - this.size * this.scale.size * .05
        )
        this.canvas.bezierVertex(
          this.x + this.size * this.scale.size - this.size * this.scale.size * .1, this.y + this.size * this.scale.size / 3 + this.size * this.scale.size * .05,
          this.x + this.size * this.scale.size / 2 - this.size * this.scale.size * .1, this.y - this.size * this.scale.size / 2 + this.size * this.scale.size * .05,
          this.x, this.y + this.size * this.scale.size * .05
        )
        this.canvas.endShape(CLOSE)
        this.canvas.pop()
        this.canvas.drawingContext.setLineDash([])

        // inner
        if (this.bg.inner) {
          this.canvas.stroke(this.layer.colors[this.bg.color])

          this.bg.inner.dash && this.canvas.drawingContext.setLineDash(this.bg.inner.dash)
          this.canvas.strokeWeight(this.bg.inner.weight)
          this.canvas.push()
          this.canvas.translate(0, -this.size * this.scale.size / 2 + .075 * this.size * this.scale.size)
          this.canvas.beginShape()
          this.canvas.vertex(this.x, this.y + this.size * this.scale.size * .15)
          this.canvas.bezierVertex(
            this.x - this.size * this.scale.size / 2 + this.size * this.scale.size * .2, this.y - this.size * this.scale.size / 2 + this.size * this.scale.size * .1,
            this.x - this.size * this.scale.size + this.size * this.scale.size * .2, this.y + this.size * this.scale.size / 3 + this.size * this.scale.size * .1,
            this.x, this.y + this.size * this.scale.size - this.size * this.scale.size * .15
          )
          this.canvas.bezierVertex(
            this.x + this.size * this.scale.size - this.size * this.scale.size * .2, this.y + this.size * this.scale.size / 3 + this.size * this.scale.size * .1,
            this.x + this.size * this.scale.size / 2 - this.size * this.scale.size * .2, this.y - this.size * this.scale.size / 2 + this.size * this.scale.size * .1,
            this.x, this.y + this.size * this.scale.size * .15
          )
          this.canvas.endShape(CLOSE)
          this.canvas.pop()
        }

        // fill
        if (this.bg.fill) {
          this.canvas.noStroke()
          this.canvas.fill(this.layer.colors[this.bg.color])
          this.canvas.push()
          this.canvas.translate(0, -this.size * this.scale.size / 2 + .075 * this.size * this.scale.size)
          this.canvas.beginShape()
          this.canvas.vertex(this.x, this.y + this.size * this.scale.size * .25)
          this.canvas.bezierVertex(
            this.x - this.size * this.scale.size / 2 + this.size * this.scale.size * .275, this.y - this.size * this.scale.size / 2 + this.size * this.scale.size * .15,
            this.x - this.size * this.scale.size + this.size * this.scale.size * .275, this.y + this.size * this.scale.size / 3 + this.size * this.scale.size * .15,
            this.x, this.y + this.size * this.scale.size - this.size * this.scale.size * .25
          )
          this.canvas.bezierVertex(
            this.x + this.size * this.scale.size - this.size * this.scale.size * .275, this.y + this.size * this.scale.size / 3 + this.size * this.scale.size * .15,
            this.x + this.size * this.scale.size / 2 - this.size * this.scale.size * .275, this.y - this.size * this.scale.size / 2 + this.size * this.scale.size * .15,
            this.x, this.y + this.size * this.scale.size * .25
          )
          this.canvas.endShape(CLOSE)
          this.canvas.pop()
        }
        this.canvas.pop()
      break
    }

    /**
     * Draw eyelashes
     */
    switch (this.params.eyelashes.type) {
      case 'chief':
        this.layer.offscreen.push()
        this.layer.offscreen.clear()
        this.layer.offscreen.noStroke()
    
        let lashes = [
          [15, -.125, .125],
          [165, .125, .125],

          [30, -.1, .1],
          [150, .1, .1],

          [45, -.075, 0.075],
          [135, .075, 0.075],

          [60, -.05, .05],
          [120, .05, .05],
          
          [75, -.025, .025],
          [105, .025, .025],

          [90, 0, 0],
        ]

        // Color cycle
        this.params.eyelashes.colorCycleCounter++
        if (this.params.eyelashes.colorCycleCounter > this.params.eyelashes.colorCycleSpeed) {
          this.params.eyelashes.colorCycleCounter = 0
          this.params.eyelashes.colorCycleStep++
        }
        
        let color = 6
        let colors = this.layer.colors.slice()
        for (let i = 0; i < this.params.eyelashes.colorCycleStep % colors.length; i++) {
          colors.unshift(colors.pop())
        }

        // Fill
        this.layer.offscreen.drawingContext.globalCompositeOperation = this.params.eyelashes.blend
        for (let i = 0; i < lashes.length; i++) {
          color -= .5
          this.layer.offscreen.fill(colors[floor(color)])
          this.layer.offscreen.push()
          this.layer.offscreen.translate(this.size * this.scale.size * lashes[i][1], -this.size * this.scale.size * .15 + this.size * this.scale.size * lashes[i][2])
          this.layer.offscreen.rotate(radians(lashes[i][0]))

          this.layer.offscreen.beginShape()
          this.layer.offscreen.vertex(-this.size * this.scale.size * this.sizeScale / 2, 0)
          this.layer.offscreen.bezierVertex(-this.size * this.scale.size * this.sizeScale / 2 * .375, -this.size * this.scale.size * this.sizeScale / 4, this.size * this.scale.size * this.sizeScale / 2 * .375, -this.size * this.scale.size * this.sizeScale / 4, this.size * this.scale.size * this.sizeScale / 2, 0)
          this.layer.offscreen.bezierVertex(this.size * this.scale.size * this.sizeScale / 2 * .375, this.size * this.scale.size * this.sizeScale / 4, -this.size * this.scale.size * this.sizeScale / 2 * .375, this.size * this.scale.size * this.sizeScale / 4, -this.size * this.scale.size * this.sizeScale / 2, 0)
          this.layer.offscreen.endShape()
          this.layer.offscreen.pop()
        }

        // Wireframe
        this.layer.offscreen.stroke(this.pupil.color)
        this.layer.offscreen.strokeWeight(this.size * this.scale.size * .0075)
        this.layer.offscreen.drawingContext.globalCompositeOperation = 'source-over'
        this.layer.offscreen.noFill()
        for (let i = 0; i < lashes.length; i++) {
          this.layer.offscreen.push()
          this.layer.offscreen.translate(this.size * this.scale.size * lashes[i][1], -this.size * this.scale.size * .15 + this.size * this.scale.size * lashes[i][2])
          this.layer.offscreen.rotate(radians(lashes[i][0]))

          this.layer.offscreen.beginShape()
          this.layer.offscreen.vertex(-this.size * this.scale.size * this.sizeScale / 2, 0)
          this.layer.offscreen.bezierVertex(-this.size * this.scale.size * this.sizeScale / 2 * .375, -this.size * this.scale.size * this.sizeScale / 4, this.size * this.scale.size * this.sizeScale / 2 * .375, -this.size * this.scale.size * this.sizeScale / 4, this.size * this.scale.size * this.sizeScale / 2, 0)
          this.layer.offscreen.bezierVertex(this.size * this.scale.size * this.sizeScale / 2 * .375, this.size * this.scale.size * this.sizeScale / 4, -this.size * this.scale.size * this.sizeScale / 2 * .375, this.size * this.scale.size * this.sizeScale / 4, -this.size * this.scale.size * this.sizeScale / 2, 0)
          this.layer.offscreen.endShape()
          this.layer.offscreen.pop()
        }

        // Erase the bottom part
        this.layer.offscreen.erase()
        this.layer.offscreen.noStroke()
        this.layer.offscreen.fill(255)
        this.layer.offscreen.rect(-this.size * this.sizeScale / 2, 0, this.size * this.scale.size * this.sizeScale, this.size * this.scale.size / 2)
        this.layer.offscreen.noErase()
        
        this.canvas.image(this.layer.offscreen, 0, 0)
        this.layer.offscreen.clear()
        this.layer.offscreen.pop()
      break
    }
    this.canvas.noStroke()

    // Handle eyelids
    if (this.blink.auto) {
      !this.isBlinking && --this.blinkTimer
      if (--this.blinkTimer <= 0 && !this.isBlinking) {
        this.forceBlink()
      }
    }

    let eyelidTop = this.eyelid.top
    let eyelidBottom = this.eyelid.bottom
    if (this.isBlinking) {
      this.curBlink += 1
      eyelidTop = eyelidTop - eyelidTop * (this.curBlink / this.blink.len)
      eyelidBottom = eyelidBottom - eyelidBottom * (this.curBlink / this.blink.len)
    }
    
    if (this.curBlink > this.blink.len) {
      this.blinkTimer = random(10, this.blink.maxWait)
      this.isBlinking = false
      this.curBlink = 0
    }

    // Eyelids
    this.canvas.push()
    this.canvas.translate(this.x, this.y)
    this.canvas.rotate(this.angle + this.scale.angle)

    // Eyelid color
    if (this.eyelid.hasOwnProperty('color')) {
      // Based on darkening the bg
      if (typeof this.eyelid.color === 'number') {
        this.setEyelidColor(this.layer.colors[this.eyelid.color])
      } else {
        this.setEyelidColor(this.eyelid.color)
      }
    // Based on darkening the bg
    } else if (this?.bg?.fill) {
      this.setEyelidColor(this.layer.colors[this.bg.color])
    } else {
      this.setEyelidColor($bg)
    }

    // Eye shape
    if (this.shape === 'almond') {
      this.canvas.beginShape()
      this.canvas.curveVertex(-this.size * this.scale.size * this.sizeScale / 2, this.eyeOffset.y)
      this.canvas.curveVertex(0, -this.size * this.scale.size * this.sizeScale / 4 + this.eyeOffset.y)
      this.canvas.curveVertex(this.size * this.scale.size * this.sizeScale / 2, this.eyeOffset.y)
      this.canvas.curveVertex(0, this.size * this.scale.size * this.sizeScale / 4 + this.eyeOffset.y)
      this.canvas.endShape(CLOSE)
  
      this.canvas.beginShape()
      this.canvas.curveVertex(this.size * this.scale.size * this.sizeScale / 2, this.eyeOffset.y)
      this.canvas.curveVertex(0, -this.size * this.scale.size * this.sizeScale / 4 + this.eyeOffset.y)
      this.canvas.curveVertex(-this.size * this.scale.size * this.sizeScale / 2, this.eyeOffset.y)
      this.canvas.curveVertex(0, this.size * this.scale.size * this.sizeScale / 4 + this.eyeOffset.y)
      this.canvas.endShape(CLOSE)
    } else {
      this.canvas.circle(0, this.eyeOffset.y, this.size * this.scale.size * this.sizeScale)
    }
    this.canvas.pop()

    // Eye whites
    this.drawWhites(eyelidTop, eyelidBottom, this.eyeWhites)
    this.layer.offscreen.drawingContext.globalCompositeOperation = 'source-atop'
    this.layer.offscreen.colorMode(...this.layer.colorMode)
    
    // Handle auto looking
    let targetX = this.look.x
    let targetY = this.look.y
    let mx, my, mxx, myy

    if (this.cloned) {
      targetX = this.cloned.look.x
      targetY = this.cloned.look.y
    } else {
      switch (this.look.mode) {
        case 'auto':
          --this.look.timer
          if (--this.look.timer <= 0) {
            this.updateLook()
          }
        break

        case 'restricted':
          --this.look.timer
          mx = this.look.x
          my = this.look.y
          mxx = this.look.xx || mx
          myy = this.look.yy || my
          
          if (--this.look.timer <= 0) {
            let angle = typeof this.look.angle === 'function' ? this.look.angle() : this.look.angle
            let r = typeof this.look.r === 'function' ? this.look.r() : this.look.r
            
            targetX = r * this.size/2 * this.scale.size * cos(angle)
            targetY = r * this.size/2 * this.scale.size * sin(angle)
            this.look.xx = r * this.size/1.85 * this.scale.size * cos(angle)
            this.look.yy = r * this.size/1.85 * this.scale.size * sin(angle)
            this.updateLook(targetX, targetY)
          }
        break

        case 'mouse':
          targetX = mouseX
          targetY = mouseY
        break
        
        case 'handsfree':
          if (handsfree.data?.pose?.poseLandmarks) {
            targetX = this.layer.width - this.layer.width * handsfree.data.pose.poseLandmarks[0].x
            targetY = this.layer.height * handsfree.data.pose.poseLandmarks[1].y
          }
        break
      }
    }
    
    // @see https://twitter.com/clayheaton/status/1437148783406616583
    if (this.look.mode === 'restricted') {

      this.layer.offscreen.fill(this.layer.colors[this.iris.color])
      this.layer.offscreen.ellipse(mx, my + this.eyeOffset.y, this.size * this.scale.size * this.sizeScale / 2.5, this.size * this.scale.size * this.sizeScale / 2.5)
  
      // Draw Pupils
      this.layer.offscreen.fill(this.pupil.color)
      switch (this.pupil.shape) {
        case 'circle':
          this.layer.offscreen.circle(mxx, myy + this.eyeOffset.y, this.size * this.scale.size * this.sizeScale / 2.5 * this.pupil.size)
        break
        case 'vert':
          this.layer.offscreen.ellipse(mxx, myy + this.eyeOffset.y,
            this.size * this.scale.size * this.sizeScale / 3 * this.pupil.size,
            this.size * this.scale.size * this.sizeScale / 3
          )
        break
        case 'horiz':
          this.layer.offscreen.ellipse(mxx, myy + this.eyeOffset.y,
            this.size * this.scale.size * this.sizeScale / 3,
            this.size * this.scale.size * this.sizeScale / 3 * this.pupil.size,
          )
        break
        case 'rect':
          this.layer.offscreen.rectMode(CENTER)
          this.layer.offscreen.rect(mxx, myy + this.eyeOffset.y,
            this.size * this.scale.size * this.sizeScale / 3.5,
            this.size * this.scale.size * this.sizeScale / 5 * this.pupil.size,
            this.size * this.scale.size * this.sizeScale * .05
          )
        break
      }

    } else {
      mx = map(targetX, 0, this.layer.width, -this.size * this.scale.size * this.sizeScale * 0.3 - (1 / this.pupil.size), this.size * this.scale.size * this.sizeScale * 0.3 + (1 / this.pupil.size))
      my = map(targetY, 0, this.layer.height, -this.size * this.scale.size * this.sizeScale * 0.15 - (0.95 / this.pupil.size), this.size * this.scale.size * this.sizeScale * 0.15 + (0.95 / this.pupil.size))
      mxx = map(targetX, 0, this.layer.width, -this.size * this.scale.size * this.sizeScale * 0.35 - (1 / this.pupil.size), this.size * this.scale.size * this.sizeScale * 0.35 + (1 / this.pupil.size))
      myy = map(targetY, 0, this.layer.height, -this.size * this.scale.size * this.sizeScale * 0.2 - (0.95 / this.pupil.size), this.size * this.scale.size * this.sizeScale * 0.2 + (0.95 / this.pupil.size))
      
      this.layer.offscreen.fill(this.layer.colors[this.iris.color])
      this.layer.offscreen.ellipse(mx, my + this.eyeOffset.y, this.size * this.scale.size * this.sizeScale / 2.5, this.size * this.scale.size * this.sizeScale / 2.5)
  
      // Draw Pupils
      this.layer.offscreen.fill(this.pupil.color)
      switch (this.pupil.shape) {
        case 'circle':
          this.layer.offscreen.circle(mxx, myy + this.eyeOffset.y, this.size * this.scale.size * this.sizeScale / 2.5 * this.pupil.size)
        break
        case 'vert':
          this.layer.offscreen.ellipse(mxx, myy + this.eyeOffset.y,
            this.size * this.scale.size * this.sizeScale / 3 * this.pupil.size,
            this.size * this.scale.size * this.sizeScale / 3
          )
        break
        case 'horiz':
          this.layer.offscreen.ellipse(mxx, myy + this.eyeOffset.y,
            this.size * this.scale.size * this.sizeScale / 3,
            this.size * this.scale.size * this.sizeScale / 3 * this.pupil.size,
          )
        break
        case 'rect':
          this.layer.offscreen.rectMode(CENTER)
          this.layer.offscreen.rect(mxx, myy + this.eyeOffset.y,
            this.size * this.scale.size * this.sizeScale / 3.5,
            this.size * this.scale.size * this.sizeScale / 5 * this.pupil.size,
            this.size * this.scale.size * this.sizeScale * .05
          )
        break
      }
    }
    
    this.layer.offscreen.pop()
    this.canvas.image(this.layer.offscreen, 0, 0, this.layer.width, this.layer.height)
  }

  /**
   * Draws the eye whites
   */
  drawWhites (eyelidTop = 1, eyelidBottom = 1, overrides = {}) {
    overrides = defaults(overrides, {
      angle: this.angle + this.scale.angle,
      fill: [255, 255 - this.redEye, 255 - this.redEye],
      size: this.size * this.scale.size,
      colorMode: [RGB],
      noStroke: true
    })

    // Can't default deep an HTML element
    if (!overrides.canvas) {
      overrides.canvas = this.layer.offscreen
    }
    overrides.canvas.push()

    // Translate
    if (typeof overrides.x !== 'undefined') {
      overrides.canvas.translate(overrides.x, overrides.y)
    }
    
    if (overrides.noStroke) {
      overrides.canvas.noStroke()
    }
    overrides.canvas.colorMode(...overrides.colorMode)
    overrides.canvas.rotate(overrides.angle)
    overrides.canvas.fill(...overrides.fill)

    // Shape
    if (this.shape === 'almond') {
      overrides.canvas.beginShape()
      overrides.canvas.curveVertex(-overrides.size * this.sizeScale / 2, this.eyeOffset.y)
      overrides.canvas.curveVertex(0, overrides.size / 4 * -eyelidTop * this.sizeScale + this.eyeOffset.y)
      overrides.canvas.curveVertex(overrides.size * this.sizeScale / 2, this.eyeOffset.y)
      overrides.canvas.curveVertex(0, overrides.size / 4 * eyelidBottom * this.sizeScale + this.eyeOffset.y)
      overrides.canvas.endShape(CLOSE)
      
      overrides.canvas.beginShape()
      overrides.canvas.curveVertex(overrides.size * this.sizeScale / 2, this.eyeOffset.y)
      overrides.canvas.curveVertex(0, overrides.size / 4 * -eyelidTop * this.sizeScale  + this.eyeOffset.y)
      overrides.canvas.curveVertex(-overrides.size * this.sizeScale / 2, this.eyeOffset.y)
      overrides.canvas.curveVertex(0, overrides.size / 4 * eyelidBottom * this.sizeScale + this.eyeOffset.y)
      overrides.canvas.endShape(CLOSE)
    } else {
      overrides.canvas.ellipse(0, this.eyeOffset.y, overrides.size * this.sizeScale, overrides.size * this.sizeScale * eyelidTop)
    }

    overrides.canvas.pop()
  }

  /**
   * Sets the fill for the eyecolor
   */
  setEyelidColor (col) {
    if (typeof col === 'number') {
      col = this.layer.colors[col]
    }

    let eyelidColor = [...col]
    eyelidColor[2] = max(0, eyelidColor[2] - .12)
    this.canvas.fill(eyelidColor)
  }

  /**
   * Force a blink
   */
  forceBlink () {
    this.isBlinking = true
    this.curBlink = 0
    this.onBlink && this.onBlink(this)
  }

  /**
   * Updates the look direction
   */
  updateLook (x, y) {
    if (typeof x === 'undefined') {
      x = random(this.layer.width * .15, this.layer.width - this.layer.width * .15)
    }
    if (typeof y === 'undefined') {
      y = random(this.layer.height * .15, this.layer.height - this.layer.height * .15)
    }

    this.look.timer = random(this.blink.lookWait)
    this.look.x = x
    this.look.y = y
  }

  /**
   * Checks if a point is iniside the thing
   * @param {*} x (Default: mouseX)
   * @param {*} y (Default: mouseY)
   * @returns 
   */
  isWithinThing (x, y) {
    if (typeof x === 'undefined') x = mouseX - this.layer.x
    if (typeof y === 'undefined') y = mouseY - this.layer.y

    // Checks inside ellipse
    // @see https://stackoverflow.com/a/16814494
    let xx = pow(
      (cos(this.angle) * (x - this.x)) +
      (sin(this.angle) * (y - this.y))
    , 2) / pow(this.size / 2, 2)
    let yy = pow(
      (sin(this.angle) * (x - this.x)) -
      (cos(this.angle) * (y - this.y))
    , 2) / pow(this.size / 4, 2)
    
    return xx + yy <= 1

    // Checks inside rectangle
    // return x > this.x - this.size * this.scale.size / 2 && x < this.x + this.size * this.scale.size / 2 && y > this.y - this.size * this.scale.size / 2 && y < this.y + this.size * this.scale.size / 2
  }

  /**
   * Shows the context menu for this Moar thing
   */
  showContextMenu (ev, menu) {
    if (!this.params.menu) return
    
    this.$menu = menu
    menu.children.forEach(m => {
      m.expanded = false
    })
    
    // General settings
    const general = this.$menu.addFolder({
      index: 1,
      title: `Eye: ${this.id}`,
      expanded: true
    })

    general.addInput(this, 'size', {
      min: 10,
      max: this.layer.width,
      step: 1
    }).on('change', ev => {
      let clones = null
      
      if (this.cloned) {
        this.cloned.size = ev.value
        clones = this.cloned.clones
      } else if (this.clones) {
        clones = this.clones
      }

      if (clones) {
        clones.forEach(clone => clone.size = ev.value)
      }
    })
    general.addInput(this.physics.body, 'angle', {
      min: -PI,
      max: PI,
      step: radians(.5)
    }).on('change', ev => {
      this.angle = ev.value
    })
    general.addInput(this.eyelid, 'top', {
      min: 0,
      max: 1,
      step: .1
    })
    general.addInput(this.eyelid, 'bottom', {
      min: 0,
      max: 1,
      step: .1
    })

    // Iris and Pupils
    const eye = general.addFolder({
      title: 'Iris & Pupil',
      expanded: true,
    })
    eye.addInput(this.pupil, 'size', {
      min: .1,
      max: .95,
      step: .01
    })
    eye.addInput(this.iris, 'color', {
      min: 0,
      // @todo This is too restrictive, especially in cases where the pupil is not black
      max: this.layer.colors.length - 2,
      step: 1
    })
    const pupilShapes = {}
    this.params.pupil.possibleShapes.forEach(type => {
      pupilShapes[type] = type
    })
    eye.addInput(this.pupil, 'shape', {
      options: pupilShapes
    })
    
    // Shapes
    const shape = general.addFolder({
      title: 'Shape',
      expanded: false,
    })
    const bodyTypes = {}
    this.params.possibleBodyTypes.forEach(type => {bodyTypes[type] = type})
    shape.addInput(this.params, 'body', {
      options: bodyTypes
    }).on('change', ev => {
      this.resetFeatures()
    })

    const eyeShapes = {}
    this.possibleShapes.forEach(type => {eyeShapes[type] = type})
    shape.addInput(this, 'shape', {
      options: eyeShapes
    }).on('change', ev => {
      this.resetFeatures()
    })

    // More settings
    if (typeof this.params.settings === 'function') {
      this.params.settings.call(this, {
        general,
        eye,
        shape
      })
    }

    // Move the menu to the mouse position
    // @fixme Refactor with Moar.showContextMenu
    setTimeout(() => {
      const bounds = this.$menu.containerElem_.getBoundingClientRect()
      if (ev.x + bounds.width > windowWidth) {
        this.$menu.containerElem_.style.left = (windowWidth - bounds.width) + 'px'
      } else {
        this.$menu.containerElem_.style.left = ev.x + 'px'
      }
      if (ev.y + bounds.height > windowHeight) {
        this.$menu.containerElem_.style.top = (windowHeight - bounds.height) + 'px'
      } else {
        this.$menu.containerElem_.style.top = ev.y + 'px'
      }
    }, 0)
  }
  
  /**
   * Handle Listeners
   */
  listeners = {
    /**
     * Poke the eye
     */
    click (ev) {
      let clicked = false
    
      if (this.isWithinThing()) {
        clicked = true
        this.iris.colorIdx = floor(random(this.layer.colors.length))
        this.resetFeatures()
        this.forceBlink()

        if (this.blink.redEye) {
          this.redEye += 75
          this.redEye = min(255, this.redEye)
        }
      }
  
      if (clicked) {
        this.params.onClick && this.params.onClick(this)
      }
      return clicked
    }
  }
}
