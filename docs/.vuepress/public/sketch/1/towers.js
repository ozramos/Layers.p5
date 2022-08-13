export default function () {
  // @see https://gorillasun.de/blog/an-algorithm-for-irregular-grids
  // @see https://openprocessing.org/sketch/1555985
  const createCell = function (tower, posX, posY, wid, hei, depth){
    if(depth>0){
      var div = random(0.25, 0.75)
      if(random()>0.5){
        createCell(tower, posX, posY, wid, hei*div, depth-1)
        createCell(tower, posX, posY+hei*div, wid, hei*(1-div), depth-1)
      }else{
        createCell(tower, posX, posY, wid*div, hei, depth-1)
        createCell(tower, posX+wid*div, posY, wid*(1-div), hei, depth-1)
      }
  
    }else{
      const col = tower.fill
      col[0] += 50 - noise(posX, posY) * 100
      col[1] += 50 - noise(posX*random(10000), posY*random(10000)) * 100
      col[2] += 50 - noise(posX*random(10000), posY*random(10000)) * 100
      
      fill(col)
      rect(posX, posY, wid, hei)
    }
  }



  class Tower {
    constructor (layer) {
      this.width = random(minSize*.15, minSize*.95)
      this.x = random(this.width*1.1, layer.width-this.width*1.1)
      this.height = random(minSize*.25, minSize*.95)
      this.depth = ~~random(3, 7)

      this.fill = random(layer.colors)

      createCell(this, this.x, layer.height-this.height, this.width, this.height, this.depth)
    }
  }



  Layers.create(() => {
    new Layer({
      id: 'towers',

      colors: ['#4ea888'],
      colorMode: RGB,

      menu: {},
      store: {
        numTowers: 0,
        towers: []
      },

      setup () {
        $numTowers = 1//random() > .5 ? ~~random(1, 4) : 1
        
        for (let i = 0; i < $numTowers; i++) {
          $towers.push(new Tower(this))
        }
      },

      draw () {}
    })
  })
}