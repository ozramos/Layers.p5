<template>
  <ParentLayout>
    <template #page-content-top>
      <Layer :layers="$page.frontmatter.layers" :isMaximized="$page.frontmatter.maximized"></Layer>

      <div class="custom-container tip devlog-meta">
        <ul>
          <li>
            <strong>Devlog:</strong> <a target="_blank" :href="$page.frontmatter.devlog">{{$page.frontmatter.devlog}}</a>
          </li>
          <li>
            <strong>Dates worked on:</strong> 
            <a class="devlog-link-date" v-for="page in $page.frontmatter.dates" :href="'/devlog/' + page + '.html'">{{page}}</a>
          </li>
        </ul>
      </div>

      <Window title="Devlog" v-if="(!$page.frontmatter.hideDevlog && $theme.env.NODE_ENV === 'development') || $theme.env.NODE_ENV !== 'development'">
        <iframe height=500 :src="$page.frontmatter.devlog"></iframe>
      </Window>
    </template>
  </ParentLayout>
</template>

<script setup>
import ParentLayout from '@vuepress/theme-default/lib/client/layouts/Layout.vue'
</script>