<script setup>
import './assets/categories'
import './blocks/boxy'
import './blocks/patch'
import './theme/codemao.theme'
import './theme/codemao.renderer'

import Navigator from './components/Navigator.vue'
import Toolbox from './components/Toolbox.vue'
import Workspace from './components/Workspace.vue'
import Zoombox from './components/Zoombox.vue'
</script>

<template>
  <Navigator />
  <Workspace />
  <Toolbox />
  <Zoombox />
</template>

<style>
html,
body,
#app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;

  border: 0;
}
</style>
