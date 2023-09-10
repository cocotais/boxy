import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'

export const useStore = defineStore('main', () => {
  const workspaceSvg = shallowRef(null)
  const searchPlugin = shallowRef(null)

  const hasLayoutSider = ref(false)
  const searchVisible = ref(false)

  return { workspaceSvg, searchPlugin, hasLayoutSider, searchVisible }
})
