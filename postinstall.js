/**
 * Copies the latest p5 into /docs/.vuepress/public
 */
const cpx = require('cpx')
cpx.copy('./node_modules/p5/lib/p5.min.js', './docs/.vuepress/public/packages', {
  update: true
})
cpx.copy('./node_modules/p5/lib/p5.js', './docs/.vuepress/public/packages', {
  update: true
})
