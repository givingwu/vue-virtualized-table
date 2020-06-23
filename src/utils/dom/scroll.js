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
