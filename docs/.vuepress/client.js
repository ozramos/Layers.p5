import {defineClientConfig} from '@vuepress/client'
import layersP5 from '@lib/layers.p5'
import * as Tweakpane from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'

export default defineClientConfig({
  async enhance ({}) {
    if (!__VUEPRESS_SSR__) {
      // We have to load p5 weirdly because it polutes the global space
      const mod = await import('../../node_modules/p5/lib/p5.min.js')
      if (typeof mod.default === 'function') {
        window.p5 = mod.default
      }

      // Load layers.p5
      await import('../../src/layers.p5.js')
      window.Layers = layersP5.Layers
      window.Layer = layersP5.Layer

      // Tweakpane doesn't work within a script module so we need to manually register it
      window.Tweakpane = Tweakpane
      window.TweakpaneEssentialsPlugin = EssentialsPlugin

      // Non webpack components
      import('../../node_modules/p5.capture/dist/p5.capture.umd.js')
    }
  }
})