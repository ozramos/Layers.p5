export default function () {
  class Mountain {
    constructor (layer) {
      const numPoints = ~~random(10, 50)
      const spacing = layer.width / numPoints
      this.peak = layer.height + (random() > .75 ? random(layer.height*.25, layer.height*.7) : random(layer.height*.25, layer.height*1.5))
      this.points = []

      noiseSeed(random()*99999)
      const detail = random(.01, .05)

      // Create mountain range
      this.points.push([-2*spacing, layer.height+this.peak*2])
      this.points.push([-2*spacing, layer.height+this.peak*2])
      for (let x = -2; x < numPoints+2; x++) {
        this.points.push([x*spacing, noise(x*detail)*this.peak])
      }
      this.points.push([layer.width+2*spacing, layer.height+this.peak*2])
      this.points.push([layer.width+2*spacing, layer.height+this.peak*2])
    }

    draw () {
      beginShape()
      for (let i = 0; i < this.points.length; i++) {
        curveVertex(this.points[i][0], this.points[i][1])
      }
      endShape(CLOSE)
    }
  }



  
  Layers.create(() => {
    new Layer({
      id: 'mountains',

      menu: {},
      store: {
        numMountains: 0,
        mountains: []
      },

      setup () {
        $numMountains = random(3, 15)
        $mountains = []

        for (let i = 0; i < $numMountains; i++) {
          $mountains.push(new Mountain(this))
        }

        // Sort by peak
        $mountains.sort((b, a) => b.peak - a.peak)
        $mountains.forEach(m => m.draw())
      },

      draw () {}
    })
  })
}