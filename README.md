# Layers.p5 🎛️🎹 - A layer-based p5.js framework with live editing and MIDI support

More details will be available soon! For now, check out https://everestwonder.com/layers.p5

# Local Development

- Install dependencies with `yarn`
  - Important: use `yarn` and not `npm i` [due to this bug](https://github.com/vuepress/vuepress-next/issues/781#issuecomment-1084031274)
- Boot things up with: `npm start`

## Overview

- The `layers.p5` p5.js framework starts in `/src/layers.p5.js`
  - This file gets built into `/dist/layers.p5.js`
- The documentation, gallery, and current collab project is built with [Vuepress 2](https://v2.vuepress.vuejs.org/). They are served from `/docs/`, with `README.md` files representing that directory's index.html
- `build-tester.html` is there to quickly test that the library build is working before publishing to NPM and for quick experimentation. Run a local server to view it with `npx http-server`

# Readme todo
[ ] How to add new sketches