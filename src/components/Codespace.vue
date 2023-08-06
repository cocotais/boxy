<template>
  <a-resize-box>
    <div id="codespace-head">
      <IconClose />
    </div>
    <pre><code id="code" class="language-javascript"></code></pre>
  </a-resize-box>
</template>

<script setup>
import { IconClose } from '@arco-iconbox/vue-boxy'
</script>

<style scoped>
.arco-resizebox {
  display: inline;
  width: 100px;
  height: 100vh;
}
</style>
