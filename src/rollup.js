// This is the file rollup will use to bundle everything
// Import anything you'd like in the final bundle here
import './layers.p5.js'

// Because Tweakpane doesn't work inside a module, we manually import it into Vuepress
// Instead we'll include only on build
import '../node_modules/tweakpane/dist/tweakpane.js'
import '../node_modules/@tweakpane/plugin-essentials/dist/tweakpane-plugin-essentials.js'
import '../node_modules/p5.capture/dist/p5.capture.umd.js'
