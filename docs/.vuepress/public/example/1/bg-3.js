export default function () {
new Layer({
  id: 'circle',
  menu: {
    size: {min: 100, max: 600}
  },
  draw () {
    clear()
    fill(255)
    circle(width / 2, height / 2, $size)
  }
})
}