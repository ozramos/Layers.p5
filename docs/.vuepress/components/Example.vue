<template>
  <div class="layersp5-layers-wrap-outer">
    <div class="layersp5-layers-wrap layersp5-example" :style="{height: wrapHeight}" ref="target"></div>
  </div>
</template>

<script>
export default {
  props: [
    // List of paths to sketch scripts to load
    // Prefix with @username/001/path to load /sketch/layersp5/001/path.js
    'layers',
    'height',
  ],

  /**
   * Create an empty array to hold the layer modules
   * Once they are all loaded, we'll run them sequentially
   */
  data() {
    return {
      loadedLayers: Array(this.layers.length).fill(null),
      numLoadedLayers: 0,
    }
  },

  computed: {
    wrapHeight () {return (this.height || 450) + 'px'}
  },

  mounted () {
    this.loadLayers()
  },
  beforeUnmount () {
    Layers.dispose()
  },

  methods: {
    loadLayers () {
      const $this = this
      $this.layers && $this.layers.forEach((path, i) => {
        if (path[0] === '@') {
          path = path.substr(1)
        }
        $this.maybeLoadScript(path, i)
      })
    },
    
    maybeLoadScript (path, i) {
      if (!window.Layers) {
        setTimeout(() => this.maybeLoadScript(path, i), 0)
      } else {
        this.loadScript(path, i)
      }
    },
    
    async loadScript (path, i) {
      // Unfortunately we have to split this out with vite
      // @see https://github.com/vitejs/vite/issues/4945#issuecomment-951770052
      const splitName = path.split('/')
      let sketch
      if (splitName.length === 1) {
        sketch = await import(`../public/example/${splitName[0]}.js`)
      } else if (splitName.length === 2) {
        sketch = await import(`../public/example/${splitName[0]}/${splitName[1]}.js`)
      } else if (splitName.length === 3) {
        sketch = await import(`../public/example/${splitName[0]}/${splitName[1]}/${splitName[2]}.js`)
      } else if (splitName.length === 4) {
        sketch = await import(`../public/example/${splitName[0]}/${splitName[1]}/${splitName[2]}/${splitName[3]}.js`)
      } else if (splitName.length === 5) {
        sketch = await import(`../public/example/${splitName[0]}/${splitName[1]}/${splitName[2]}/${splitName[3]}/${splitName[4]}.js`)
      } else if (splitName.length === 6) {
        sketch = await import(`../public/example/${splitName[0]}/${splitName[1]}/${splitName[2]}/${splitName[3]}/${splitName[4]}/${splitName[5]}.js`)
      } else if (splitName.length === 7) {
        sketch = await import(`../public/example/${splitName[0]}/${splitName[1]}/${splitName[2]}/${splitName[3]}/${splitName[4]}/${splitName[5]}/${splitName[6]}.js`)
      }

      Layers.target = this.$refs.target
      this.loadedLayers[i] = sketch
      this.numLoadedLayers++

      if (this.numLoadedLayers === this.layers.length) {
        this.loadedLayers.forEach(sketch => {
          sketch.default()
        })
      }
    }
  }
}
</script>