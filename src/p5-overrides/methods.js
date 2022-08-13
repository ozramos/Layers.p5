export default function () {
  globalThis.loadPixels = () => {
    this.canvas.loadPixels()
    globalThis.pixels = this.canvas.pixels
  }
  globalThis.canvas = this.canvas
  globalThis.offscreen = this.offscreen
  globalThis.frameCount = this.frameCount
  
  // Looping
  globalThis.noLoop = () => {
    this.noLoop = true
    this._context.noLoop()
  }
  globalThis.loop = () => {
    const _noLoop = this.noLoop
    this.noLoop = false
    this._context.loop()
    if (_noLoop) {
      this.draw()
    }
  }
}