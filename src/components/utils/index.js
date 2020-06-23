import Vue from 'vue';

/**
 * pos
 * @param {Number} pos
 */
export const geneArrByNumber = pos => [...Array.from({ length: ++pos }).keys()]


/**
 * flattenArrayWithDepth
 * @param {Tree} tree
 * @param {Number} depth
 * @param {Tree} parent
 */
export const flattenArrayWithDepth = (tree = [], depth = 0, parent = null) => {
  let flattened = []

  tree.map(item => {
    flattened.push(item)
    parent && Vue.set(item, '_parent', parent) // flag parent object to control self show/hide status
    Vue.set(item, '_depth', depth)
    Vue.set(item, '_show', false)

    if (item.children && item.children.length) {
      Vue.set(item, '_expand', false)
      flattened.push(...flattenArrayWithDepth(item.children || [], depth + 1, item))
      // delete item.children
    }
  })

  return flattened;
}
