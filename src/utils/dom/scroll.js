/**
 * forceScroll
 * @param {number} scrollLeft
 * @param {HTMLDivElement} target
 */
export function forceScroll(scrollLeft, target) {
  if (target && target.scrollLeft !== scrollLeft) {
    target.scrollLeft = scrollLeft
  }
}

/**
 * forceScrollTop
 * @param {number} scrollTop
 * @param {HTMLDivElement} target
 */
export function forceScrollTop(scrollTop, target) {
  if (target && target.scrollTop !== scrollTop) {
    target.scrollTop = scrollTop
  }
}
