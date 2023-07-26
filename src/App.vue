<script setup>
import { ref } from "vue";

import BoxyWorkSpace from "./workspace/workspace.vue";

import toolboxConfig from "./toolbox/toolbox.json";

const foo = ref();
const options = {
  toolbox: toolboxConfig,
  trashcan: false,
  media: "media/",
  zoom: {
    controls: true,
    wheel: true,
    startScale: 0.8,
    maxScale: 1.4,
    minScale: 0.5,
  },
  move: {
    scrollbars: true,
    drag: true,
    wheel: true,
  },
  theme: "codemao",
  renderer: "codemao",
};
</script>

<template>
  <BoxyWorkSpace id="boxy" :options="options" ref="foo"></BoxyWorkSpace>
</template>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

html,
body {
  margin: 0;
}

#boxy {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
