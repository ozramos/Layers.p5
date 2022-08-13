export default function () {
  Layers.create(() => {
    new Layer({
      menu: {
        scale: {
          min: .1,
          max: .5,
          resetOnChange: true
        },
        spacing: {
          min: .5,
          max: 1,
          resetOnChange: true
        },
      },
      
      setup () {
        this.things = []
        let totalSize = minSize*$scale
        let size = totalSize*$spacing
        let xCount = ~~(width/totalSize)
        let yCount = ~~(height/totalSize)

        // Create a 3x3 grid of eyes
        let id = 0
        for (let x = 0; x < xCount; x++) {
          for (let y = 0; y < yCount; y++) {
            this.addEye(width/2 - (xCount*totalSize/2) + x*totalSize + totalSize/2, height/2 - (yCount*totalSize/2) + y*totalSize + totalSize/2, size, {
              id
            })
            id++
          }
        }
      },

      draw () {
        background($bg)
      }
    })
  })
}