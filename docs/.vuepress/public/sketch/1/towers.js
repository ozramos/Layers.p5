export default function () {
  // @see https://gorillasun.de/blog/an-algorithm-for-irregular-grids
  // @see https://openprocessing.org/sketch/1555985
  const createCell = function (tower, x, y, w, h, depth){
    if(depth>0){
      var div = random(0.25, 0.75)
      if(random()>0.5){
        createCell(tower, x, y, w, h*div, depth-.5)
        createCell(tower, x, y+h*div, w, h*(1-div), depth-1)
      }else{
        createCell(tower, x, y, w*div, h, depth-1)
        createCell(tower, x+w*div, y, w*(1-div), h, depth-1)
      }
  
    }else{
      noFill()
      stroke(255)
      strokeWeight(minSize*.0065)
      rect(x, y, w, h)
    }
  }



  class Tower {
    constructor (layer) {
      this.width = random(minSize*.15, minSize*.95)
      this.x = layer.width/2 - this.width/2
      this.height = random(minSize*.25, minSize*.95)
      this.depth = ~~random(3, 5)

      // createCell(this, this.x, layer.height-this.height, this.width, this.height, this.depth)
      createCell(this, this.x, layer.height/2-this.height/2, this.width, this.height, this.depth)
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

        const margin = minSize*.015
        strokeWeight(minSize*.0045)
        rect(margin, margin, this.width-margin*2, this.height-margin*2)
      },

      draw () {}
    })
  })
}