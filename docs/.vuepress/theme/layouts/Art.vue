<template>
  <ParentLayout>
    <template #page-content-top>
      <Layer :layers="$page.frontmatter.layers" :height="$page.frontmatter.height || 500" :isMaximized="$page.frontmatter.maximized"></Layer>
    </template>
    <template #page-content-bottom>
      <Window title="Devlog" v-if="$page.frontmatter.devlog && ((!$page.frontmatter.hideDevlog && $theme.env.NODE_ENV === 'development') || $theme.env.NODE_ENV !== 'development')">
        <!-- @fixme Use config file for this -->
        <iframe :src="'https://layersp5.workers.dev/' + $page.frontmatter.devlog"></iframe>
      </Window>
    </template>
  </ParentLayout>
</template>

<script setup>
import ParentLayout from '@vuepress/theme-default/lib/client/layouts/Layout.vue'
</script>