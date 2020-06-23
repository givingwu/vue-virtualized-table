export function debounce(func, wait, immediate) {
  let timeout
  function debounceFunc(...args) {
    const context = this

    // https://fb.me/react-event-pooling
    if (args[0] && args[0].persist) {
      args[0].persist()
    }

    const later = () => {
      timeout = null

      if (!immediate) {
        func.apply(context, args)
      }
    }

    const callNow = immediate && !timeout

    clearTimeout(timeout)

    timeout = setTimeout(later, wait)

    if (callNow) {
      func.apply(context, args)
    }
  }

  debounceFunc.cancel = function cancel() {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return debounceFunc
}
