export default class TreeDataAdapter {
  constructor({
    id = '',
    root = false,
    tree = [],
    start = -1,
    parent = null,
    getRowKey = (item) => item.id
  }) {
    this.id = id
    this.getRowKey = getRowKey

    if (root) {
      // DEFAULT ID FOR ROOT NODE
      if (!this.id) {
        this.id = 'root'
      }

      // ROOT FLAGS
      this.isRoot = true
      this.depth = 0

      // ROOT PROPERTIES
      this.depthNodeMap = {}
      this.leavesNodeMap = {}
    }

    if (parent) {
      this.parent = parent
      this.depth = parent.depth + 1
    }

    if (~start) {
      this.startIndex = start
    }

    if (tree && tree.length) {
      // 数据源
      this.data = tree

      const top = this._init(tree)._findTopNode()

      if (!top.depthNodeMap[this.depth]) {
        top.depthNodeMap[this.depth] = {}
      }

      top.depthNodeMap[this.depth][this.id] = this
      top.leavesNodeMap[this.id] = this
    }
  }

  _init(tree) {
    if (Array.isArray(tree) && tree.length) {
      const parent = this.getParentItem()

      for (let i = 0; i < tree.length; i++) {
        const child = tree[i]

        child.__depth = this.depth
        child.__tree = this

        if (parent) {
          child.__parent = parent
          child.__index = i
        }

        if (Array.isArray(child.children) && child.children.length) {
          const childID = this.getRowKey(child)

          // eslint-disable-next-line
          childID &&
            ((this.leaves || (this.leaves = {}))[childID] = new TreeDataAdapter(
              {
                id: this.getRowKey(child),
                getRowKey: this.getRowKey,
                tree: child.children,
                start: i,
                parent: this
              }
            ))
        }
      }
    }

    return this
  }

  /**
   * _findTopNode
   * @param {(parent: {}) => boolean} callback
   * @returns {{}}
   */
  _findTopNode() {
    if (this.isRoot) {
      return this
    } else {
      let parent = this

      while (parent.parent) {
        parent = parent.parent
      }

      return parent
    }
  }

  /**
   * 插入数据
   * @param {{}} config
   */
  _insertDataFromStart({
    start, // number
    data, // any[]
    insert // any[]
  }) {
    if (!Array.isArray(data) || !Array.isArray(insert)) throw new TypeError()

    const left = data.slice(0, start + 1)
    const mid = [...insert]
    const right = data.slice(start + 1)

    return [...left, ...mid, ...right]
  }

  /**
   * 查找起始 index
   * @param {any[]|string|number} [data]
   * @param {string|number|undefined} [value]
   */
  findIndex(data, value) {
    if (Array.isArray(data)) {
      if (!value || !(typeof value === 'string' || typeof value === 'number')) {
        value = this.id
      }
    } else {
      if (typeof data === 'string' || typeof data === 'number') {
        value = data
        data = this.data
      } else {
        throw new ReferenceError(
          'The value must be passed in with a number or string type.'
        )
      }
    }

    return data.findIndex((item) => this.getRowKey(item) === value)
  }

  getParentItem() {
    if (this.parent) {
      const data = this.parent.data || []
      const index = this.findIndex(data)

      if (~index) {
        return data[index]
      }
    }
  }

  getPrevItemById(id) {
    const data = this.data || []
    const currentIndex = this.findIndex(data, id)

    if (~currentIndex) {
      return data[currentIndex - 1]
    }
  }

  getNextItemById(id) {
    const data = this.data || []
    const currentIndex = this.findIndex(data, id)

    if (~currentIndex) {
      return data[currentIndex + 1]
    }
  }

  /**
   * 查询节点
   * @returns {TreeDataAdapter|undefined}
   */
  findNodeByKey(key) {
    return this._findTopNode().leavesNodeMap[key]
  }

  /**
   * 查询节点深度
   * @param {number|undefined} key
   */
  findNodeDepthByKey(key) {
    const top = this._findTopNode()
    const depthNodeMap = top.depthNodeMap
    const depthKeys = Object.keys(depthNodeMap)

    for (let k = 0; k < depthKeys.length; k++) {
      const depthKey = depthKeys[k]
      const nodeMap = depthNodeMap[depthKey]

      if (nodeMap[key]) {
        return depthKey
      }
    }
  }

  /**
   * 查询当前节点所有子节点
   * @returns {Array<string|number>}
   */
  findChildrenLeaves() {
    let leavesKeys = []

    if (this.leaves) {
      let currLeavesKeys = Object.keys(this.leaves)
      leavesKeys = leavesKeys.concat(currLeavesKeys)

      let nodeKey = null

      while (currLeavesKeys.length) {
        nodeKey = currLeavesKeys.pop()

        const node = this.findNodeByKey(nodeKey)

        if (node && node instanceof TreeDataAdapter) {
          leavesKeys = leavesKeys.concat(node.findChildrenLeaves())
        }
      }
    }

    return leavesKeys
  }

  genExpandedKeys() {
    const expandedKeys = []
    let parent = this

    if (this.data && this.data.length) {
      expandedKeys.unshift(this.id)
    }

    while (parent.parent) {
      parent = parent.parent

      // 如果是根节点，其ID无须被展开，因为本身也不会参与状态计算
      if (!parent.isRoot) {
        expandedKeys.unshift(parent.id)
      }
    }

    return expandedKeys
  }

  /**
   * 返回所有父节点
   * @param {Array<string|number>} key
   */
  genParentPath(key) {
    const node = this.findNodeByKey(key)

    if (node && node.depth) {
      const parentPath = []
      let parent = node
      parentPath.unshift(parent.id)

      while (parent.parent) {
        parent = parent.parent

        // 如果是根节点，其ID无须被展开，因为本身也不会参与状态计算
        if (!parent.isRoot) {
          parentPath.unshift(parent.id)
        }
      }

      return parentPath
    } else {
      return [key]
    }
  }

  /**
   * 插入/生成数据
   * @param {any} data
   * @returns {any[]}
   */
  genData(data) {
    if (this.depth && this.parent) {
      const startIndex = data ? this.findIndex(data) : this.startIndex

      return this._insertDataFromStart({
        start: startIndex,
        data: data || this.parent.data,
        insert: this.data
      })
    } else {
      if (this.isRoot) {
        return this.data
      }

      return []
    }
  }
}
