export default function () {
new Layer({
  menu: {
    emoji: ['🧘', '🧘‍♀️', '🧘‍♂️'],
    depth: {min: 1, max: 15}
  },
  setup () {
    textAlign(CENTER, CENTER)
    drawingContext.shadowBlur = 5
    drawingContext.shadowColor = '#000'
  },
  draw () {
    clear()
    const size = Layers.circle.store.size
    for (let i = 0; i < $depth; i++) {
      textSize(size * .8 - i * size * .05)
      text($emoji, width/2, height/2)
    }
    textSize(size * .25 + size * sin(frameCount/this.fps) * .1)
    text('💖', width/2, height/2)
  }
})
}