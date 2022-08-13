export default function () {

Layers.create(() => {
  new Layer({
    id: 'brushify',
    noLoop: true,
    menuDisabled: true,
    type: 'filter',

    menu: {},
    store: {
      smear: []
    },

    setup () {
      // Pick a bunch of random points to smear
      $smear = []
      for (let i = 0; i < 1000; i++) {
        const x = random(width)
        const y = random(height)
        const thickness = random(minSize*.05, minSize*.1)

        for (let j = 0; j < thickness; j++) {
          $smear.push({
            x, y,
            height: random(minSize*.3, minSize),
          })
        }
      }
    },

    draw () {
      // Get the points
      $smear.forEach((point, n) => {
        point.color = get(point.x, point.y)
        if (!point.color[3]) {
          delete $smear[n]
        }
      })

      // Smear the points
      strokeWeight(minSize*.001)
      colorMode(RGB)
      $smear.forEach(point => {
        const col = [...point.color]
        const darken = random(100, 255)
        col[0] -= darken
        col[1] -= darken
        col[2] -= darken
        col[3] = 0

        const gradient = drawingContext.createLinearGradient(point.x, point.y, point.x, point.y-point.height)
        gradient.addColorStop(0, `rgba(${point.color[0]}, ${point.color[1]}, ${point.color[2]}, ${point.color[3]})`)
        gradient.addColorStop(1, `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${col[3]})`)
        drawingContext.strokeStyle = gradient

        drawingContext.beginPath()
        drawingContext.moveTo(point.x, point.y)
        drawingContext.lineTo(point.x, point.y-point.height)
        drawingContext.stroke()
      })
      colorMode(...this.colorMode)
    }
  })
})
}