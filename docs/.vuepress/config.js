const {viteBundler} = require('@vuepress/bundler-vite')
const {path} = require('@vuepress/utils')
const {registerComponentsPlugin} = require('@vuepress/plugin-register-components')
const {themeDataPlugin} = require('@vuepress/plugin-theme-data')
const pkg = require('../../package.json')
const {localTheme} = require('./theme')
const {containerPlugin} = require('@vuepress/plugin-container')

module.exports = {
  title: 'Layers.p5 🎛️🎹',
  description: 'A layer-based p5.js framework with live editing and MIDI support',
  theme: localTheme(),

  head: [
    ['link', {rel: 'icon', type: 'image/png', href: '/layersp5.png'}]
  ],

  plugins: [
    // @see https://snippetors.github.io/plugins/vuepress-plugin-tabs.html
    registerComponentsPlugin({
      // componentsDir: path.resolve(__dirname, './components/'),
      components: {
        Layer: path.resolve(__dirname, './components/Layer.vue'),
        Example: path.resolve(__dirname, './components/Example.vue'),
        Window: path.resolve(__dirname, './components/Window.vue'),
      }
    }),

    // Removes default title from ::: ::: containers
    containerPlugin({
      type: 'tip',
      before: (info) => `<div class="custom-container tip">${info ? `<p class="custom-container-title">${info}</p>` : ''}\n`,
      after: () => '</div>\n'
    }),

    themeDataPlugin({
      themeData: {
        // Globals
        pkgVersion: pkg.version,
        env: process.env,

        // Theme
        logo: '/layersp5-title.png',
        repo: 'everestwonder/layers.p5',
        
        locales: {
          '/': {
            editLinkText: 'Edit this page on GitHub',
            lastUpdatedText: 'Last updated',
            contributorsText: 'Contributors',
          }
        },

        sidebar: [
          {
            text: '👋 Introduction',
            link: '/'
          },
          {
            text: ' 🖼️ Art',
            link: '/art/',
            collapsible: true,
            children: [
              {
                text: '',
                link: ''
              },
            ]
          },
        ]
      }
    })
  ],

  bundler: viteBundler({
    viteOptions: {
      resolve: {
        alias: {
          '&': path.resolve(__dirname, '../../'),
          '@lib': path.resolve(__dirname, '../../src'),
        }
      }
    },
  }),
}