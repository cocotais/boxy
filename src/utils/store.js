import { defineStore } from 'pinia'

export const useStore = defineStore('main', {
  state: () => {
    return {
      workspace: null,
      search: null,
      hasLayoutSider: false,
      trashcanOpen: false
    }
  }
})
