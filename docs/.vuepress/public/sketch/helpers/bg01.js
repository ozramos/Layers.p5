export default function () {
  // @fixme make this generic
  Layers.create(() => {
    new Layer({
      id: 'bg01',
      colors: ['#e5be83'],
      colorMode: RGB,
      
      menu: {},
      store: {},

      setup () {
        console.log(this.colors)
        background(this.colors[0])
      },

      draw () {}
    })
  })
}