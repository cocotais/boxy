import { defineStore } from 'pinia'

export const useStore = defineStore('main', {
  state: () => {
    return {
      workspace: null,
      hasCodespace: false
    }
  }
})
