export const DFSForEach = (children, callback, depth) => {
  if (children && children.length) {
    depth = depth || 0

    let child

    for (let i = 0, l = children.length; i < l; i++) {
      child = children[i]

      if (child && callback(child, depth)) {
        return child
      }

      if (
        child.children &&
        (child = DFSForEach(child.children, callback, depth + 1))
      ) {
        return child
      }
    }
  }
}
