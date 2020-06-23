// import raf from "raf"

/**
 * @see {@link https://www.npmjs.com/package/raf}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame}
 *
 * The method takes a callback as an argument to be invoked before the repaint.
 *
 * @param {Function} callback callback is the function to invoke in the next frame.
 * @returns {Function}
 *
 * @usage
 * ```js
  var raf = require('raf')

  raf(function tick() {
    // Animation logic
    raf(tick)
  })
 * ```
 */
export function useRaf(callback) {
  /**
   * handle is a long integer value that uniquely identifies the entry in the callback list.
   * This is a non-zero value, but you may not make any other assumptions about its value.
   */
  const handle = requestAnimationFrame(callback)

  /**
   * handle is the entry identifier returned by raf().
   * Removes the queued animation frame callback
   * (other queued callbacks will still be invoked unless cancelled).
   */
  return function cancelUseRef() {
    return cancelAnimationFrame(handle)
  }
}
