export default function () {
  // @see https://gorillasun.de/blog/an-algorithm-for-irregular-grids
  // @see https://openprocessing.org/sketch/1555985
  const createCell = function (posX, posY, wid, hei, depth){
    if(depth>0){
      var div = random(0.25, 0.75)
      if(random()>0.5){
        createCell(posX, posY, wid, hei*div, depth-1)
        createCell(posX, posY+hei*div, wid, hei*(1-div), depth-1)
      }else{
        createCell(posX, posY, wid*div, hei, depth-1)
        createCell(posX+wid*div, posY, wid*(1-div), hei, depth-1)
      }
  
    }else{
      rect(posX, posY, wid, hei)
    }
  }



  class Tower {
    constructor (layer) {
      this.width = random(minSize*.15, minSize*.7)
      this.x = random(this.width*1.1, layer.width-this.width*1.1)
      this.height = random(minSize*.25, minSize*.95)
      this.depth = ~~random(3, 5)

      createCell(this.x, layer.height-this.height, this.width, this.height, this.depth)
    }
  }



  Layers.create(() => {
    new Layer({
      id: 'towers',

      menu: {},
      store: {
        numTowers: 0,
        towers: []
      },

      setup () {
        $numTowers = random() > .5 ? ~~random(1, 3) : 1
        
        for (let i = 0; i < $numTowers; i++) {
          $towers.push(new Tower(this))
        }
      },

      draw () {}
    })
  })
}