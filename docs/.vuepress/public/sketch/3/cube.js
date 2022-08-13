export default function () {
  Layers.create(() => {
    const size = minSize*.6
    new Layer({
      id: 'cube',
      renderer: WEBGL,
      noLoop: true,

      menu: {
        bg: {
          type: 'slider',
          options: Layers.default.colors
        }
      },

      draw () {
        clear()
        background($bg)
        noFill()
        stroke(255)
        strokeWeight(minSize*.025)

        push()
        rotateY(random(-PI/6, PI/6))
        box(size*1.2)
        pop()
      }
    })
  })
}