export default function () {
new Layer({
  menu: {
    bg: Layers.default.colors
  },
  draw () {
    background($bg)
  }
})
}