import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'

export const useStore = defineStore('main', () => {
  const workspace = shallowRef(null)
  const search = shallowRef(null)
  const hasLayoutSider = ref(false)
  const trashcanOpen = ref(false)
  const searchOpen = ref(false)

  return { workspace, search, hasLayoutSider, trashcanOpen, searchOpen }
})
