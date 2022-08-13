export default {
  /**
   * Creates a polygon
   * @see https://p5js.org/examples/form-regular-polygon.html
   * @param {*} canvas
   * @param {*} x 
   * @param {*} y 
   * @param {*} radius 
   * @param {*} npoints 
   */
  polygon (canvas, radius, npoints, z) {
    let angle = TWO_PI / npoints
    canvas.push()
    canvas.beginShape()
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = cos(a) * radius
      let sy = sin(a) * radius
  
      if (typeof z !== 'undefined') {
        canvas.vertex(sx, sy, z)
      } else {
        canvas.vertex(sx, sy)
      }
    }
    canvas.endShape(CLOSE)
    canvas.pop()
  },

  /**
   * @see https://p5js.org/examples/form-star.html
   * @param {*} canvas
   * @param {*} x 
   * @param {*} y 
   * @param {*} radius1 Outer radius of star
   * @param {*} radius2 Inner radius of star
   * @param {*} npoints Number of points
   */
  star (canvas, x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints
    let halfAngle = angle / 2.0
    canvas.beginShape()
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * radius2
      let sy = y + sin(a) * radius2
      canvas.vertex(sx, sy)
      sx = x + cos(a + halfAngle) * radius1
      sy = y + sin(a + halfAngle) * radius1
      canvas.vertex(sx, sy)
    }
    canvas.endShape(CLOSE)
  }
}