<template>
<div class="window window-component mb-md" ref="window" :class="{maximized: _isMaximized, minimized: _isMinimized}">
  <div class="title-bar" v-if="hasTitlebar">
    <div class="title-bar-text" @click="onHelp" style="cursor: pointer">{{windowTitle}}</div>
    <div class="title-bar-controls" v-if="hasTitlebarControls">
      <button v-if="help" aria-label="Help" @click="onHelp"></button>
      <button v-if="minimize" aria-label="Minimize" @click="onMinimize"></button>
      <button v-if="maximize || minimize" aria-label="Restore" @click="onRestore"></button>
      <button v-if="maximize" aria-label="Maximize" @click="onMaximize"></button>
    </div>
  </div>
  <div class="window-body" :style="{height: `${height}px`}">
    <slot></slot>
  </div>
</div>
</template>

<script>
export default {
  // List of paths to sketch scripts to load
  // Prefix with @username/001/path to load /sketch/username/001/path.js
  props: {
    height: {
      type: [Number, String],
      default: 350
    },
    title: String,
    maximize: {
      type: Boolean,
      default: true
    },
    minimize: Boolean,
    isMaximized: Boolean,
    isMinimized: Boolean,
    help: String,
  },

  /**
   * Create an empty array to hold the layer modules
   * Once they are all loaded, we'll run them sequentially
   */
  data() {
    return {
      _isMinimized: this.isMinimized,
      _isMaximized: this.isMaximized,
    }
  },

  computed: {
    hasTitlebar () {
      return this.hasTitlebarControls || this.title
    },
    hasTitlebarControls () {
      return this.maximize || this.minimize || this.help
    },
    windowTitle () {return this.title || this.$page.title}
  },

  methods: {
    /**
     * Handle window resize
     */
    onMinimize () {
      this.$refs.window.classList.add('minimized')
      this.$refs.window.classList.remove('maximized')
      this._isMinimized = true
      this._isMaximized = false
      this.$emit('minimized')
    },

    onMaximize () {
      this.$refs.window.classList.add('maximized')
      this.$refs.window.classList.remove('minimized')
      this._isMinimized = false
      this._isMaximized = true
      this.$emit('maximized')
    },
    
    onRestore () {
      this.$refs.window.classList.remove('maximized', 'minimized')
      this._isMinimized = false
      this._isMaximized = false
      this.$emit('restored')
    },

    onHelp () {
      if (!this.help) return
      
      // Unfortunately we have to split this out with vite
      // @see https://github.com/vitejs/vite/issues/4945#issuecomment-951770052
      let page = ''
      let helpLink = this.help
      if (this.help[0] === '@') {
        helpLink = this.help.substr(1)
        page = `/art/`
      }

      const splitName = helpLink.split('/')
      if (splitName.length === 1) {
        page += `${splitName[0]}.html`
      } else if (splitName.length === 2) {
        page += `${splitName[0]}/${splitName[1]}.html`
      } else if (splitName.length === 3) {
        page += `${splitName[0]}/${splitName[1]}/${splitName[2]}.html`
      } else if (splitName.length === 4) {
        page += `${splitName[0]}/${splitName[1]}/${splitName[2]}/${splitName[3]}.html`
      } else if (splitName.length === 5) {
        page += `${splitName[0]}/${splitName[1]}/${splitName[2]}/${splitName[3]}/${splitName[4]}.html`
      } else if (splitName.length === 6) {
        page += `${splitName[0]}/${splitName[1]}/${splitName[2]}/${splitName[3]}/${splitName[4]}/${splitName[5]}.html`
      } else if (splitName.length === 7) {
        page += `${splitName[0]}/${splitName[1]}/${splitName[2]}/${splitName[3]}/${splitName[4]}/${splitName[5]}/${splitName[6]}.html`
      }

      this.$router.push(page)
    }
  }
}
</script>