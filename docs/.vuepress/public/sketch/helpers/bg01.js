export default function () {
  Layers.create(() => {
    new Layer({
      id: 'bg01',

      menu: {},
      store: {},

      setup () {},

      draw () {
        background($bg)
      }
    })
  })
}