function observer(selector, attributeFilter, callback) {
  let element = document.querySelector(selector)
  let observer = new window.MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        callback(element)
      }
    })
  })
  observer.observe(element, {
    attributes: true,
    attributeFilter: attributeFilter
  })
}

export default observer
