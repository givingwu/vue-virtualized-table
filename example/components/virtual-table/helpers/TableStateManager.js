/* eslint-disable no-prototype-builtins */
import { deepCopy } from "./utils/index"
import fastDeepEqual from "fast-deep-equal"
import TreeDataAdapter from "./TreeDataAdapter"

let entireDataSource = null
let _cached = null
let _rootTree = null

/**
 * @typedef {number|string} RowKey
 *
 * @typedef Row
 * @property {RowKey} rowKey
 * @property {Row[]} [children]
 */
export default class TableStateManager {
  constructor(
    initialState = {
      dataSource: [], // any[]
      rowKey: "id", // string | (row: object, index: number) => string
      expandDepth: null, // number
      expandedRowKeys: null, // number[]
      defaultExpandAllRows: null, // boolean
      rowSelectionType: null, // { type: 'radio' | 'checkbox', selectedRowKeys: Array<string|number> }
      selectedRowKeys: null,
    }, // initialState: {}
    callback = () => {}
  ) {
    // only used in inner state
    this.dataSource = []

    // used for common state & shared with Table component
    this.rowKey = null
    this.expandDepth = null
    this.expandedRowKeys = null
    this.defaultExpandAllRows = null

    /**
     *  rowSelectionType: 'radio' | 'checkbox', // 单选/多选,
     *  selectedRowKeys:  Array<string|number> // 被选中的 keys 数组(不包含 hover 的 rowKey)
     */
    this.rowSelectionType = null
    this.selectedRowKeys = null
    this.currentHoveredKey = null

    this.setState(initialState, callback)
  }

  getRowKey(row, index) {
    const rowKey = this.rowKey
    let key

    if (!row) throw new Error("row is required when get row identity")
    if (typeof rowKey === "string") {
      if (rowKey.indexOf(".") < 0) {
        key = row[rowKey]
        key = +key || key // when number type
      }

      let keyStr = rowKey.split(".")
      let current = row

      for (let i = 0; i < keyStr.length; i++) {
        current = current[keyStr[i]]
      }

      key = current
    } else if (typeof rowKey === "function") {
      key = rowKey(row, index)
    }

    return key === undefined ? index : key
  }

  get _cached() {
    return _cached
  }

  set _cached(val) {
    return (_cached = val)
  }

  get _sideEffectKeys() {
    return [
      "expandDepth",
      "expandedRowKeys",
      "defaultExpandAllRows",
      "rowSelectionType",
      "selectedRowKeys",
    ]
  }

  get rootTreeDataAdapter() {
    return _rootTree
  }

  set rootTreeDataAdapter(val) {
    return (_rootTree = val)
  }

  setState(state, callback) {
    console.log("setState: ", state)
    for (let prop in state) {
      if (
        state.hasOwnProperty(prop) && // is state own properties
        this.hasOwnProperty(prop) && // is instance own properties
        typeof state[prop] !== "function" // is not a function type
      ) {
        if (prop === "dataSource") {
          this._updateDataSource(state[prop])
        } else {
          if (!fastDeepEqual(state[prop], this[prop])) {
            const value = state[prop]

            this[prop] = typeof value === "object" ? deepCopy(value) : value
            this._updateSideEffectByKey(prop)
          }
        }
      }
    }

    if (typeof callback === "function") {
      callback(this)
    }
  }

  _updateDataSource(dataSource) {
    dataSource = Object.freeze(dataSource.slice())
    this.dataSource = dataSource

    if (!dataSource || !dataSource.length) return this.clearSideEffects()

    if (dataSource !== entireDataSource) {
      // if (this._initialized) this._initialized = false
      entireDataSource = dataSource || []

      // clean inner cached
      this._cached = null
      // redefine a new TreeDataAdapter instance
      this.rootTreeDataAdapter = new TreeDataAdapter({
        root: true,
        id: "root",
        tree: entireDataSource,
        getRowKey: this.getRowKey.bind(this),
      })

      this._updateSideEffects()
      this._initialized = true
    }
  }

  _updateSideEffects() {
    if (!entireDataSource || !entireDataSource.length) return

    const {
      expandDepth,
      selectedRowKeys,
      rowSelectionType,
      defaultExpandAllRows,
    } = this
    let { expandedRowKeys } = this

    if (this._initialized) {
      if (expandedRowKeys && expandedRowKeys.length) {
        expandedRowKeys = this.checkExpandedRowKeys(expandedRowKeys)
      }

      // 优先级: expandedRowKeys > expandDepth > defaultExpandAllRows
      if (Array.isArray(expandedRowKeys) && expandedRowKeys.length) {
        this.toggleExpandKeys(expandedRowKeys)
      } else if (typeof expandDepth === "number" && +expandDepth) {
        this.toggleExpandDepth(expandDepth)
      } else if (typeof defaultExpandAllRows === "boolean") {
        this.toggleExpandAll(defaultExpandAllRows)
      }
    } else {
      // 优先级: defaultExpandAllRows > expandDepth > expandedRowKeys
      if (typeof defaultExpandAllRows === "boolean") {
        this.toggleExpandAll(defaultExpandAllRows)
      } else if (typeof expandDepth === "number") {
        this.toggleExpandDepth(expandDepth)
      } else if (Array.isArray(expandedRowKeys)) {
        this.toggleExpandKeys(expandedRowKeys)
      }
    }

    if (rowSelectionType && typeof rowSelectionType === "string") {
      if (selectedRowKeys && Array.isArray(selectedRowKeys)) {
        this.selectedRowKeys = selectedRowKeys
      } else {
        this.selectedRowKeys = []
      }
    }
  }

  _updateSideEffectByKey(key) {
    if (!entireDataSource || !Array.isArray(entireDataSource)) return
    if (!this._sideEffectKeys.includes(key)) {
      return
    }

    const {
      expandDepth,
      selectedRowKeys,
      rowSelectionType,
      defaultExpandAllRows,
    } = this
    let { expandedRowKeys } = this

    if (
      key === "defaultExpandAllRows" &&
      typeof defaultExpandAllRows === "boolean"
    ) {
      return this.toggleExpandAll(defaultExpandAllRows)
    }

    if (key === "expandDepth" && typeof expandDepth === "number") {
      return this.toggleExpandDepth(expandDepth)
    }

    if (key === "expandedRowKeys" && Array.isArray(expandedRowKeys)) {
      return this.toggleExpandKeys(expandedRowKeys)
    }

    if (key === "rowSelectionType") {
      if (typeof rowSelectionType === "string") {
        return (this.selectedRowKeys = Array.isArray(selectedRowKeys)
          ? selectedRowKeys
          : [])
      } else {
        return (this.selectedRowKeys = [])
      }
    }

    if (key === "selectedRowKeys") {
      if (rowSelectionType) {
        return (this.selectedRowKeys = Array.isArray(selectedRowKeys)
          ? selectedRowKeys
          : [])
      }
    }
  }

  /**
   * 是否是当前选中行
   * @param {RowKey} rowKey
   */
  isHoveredRow(rowKey) {
    return this.currentHoveredKey && this.currentHoveredKey === rowKey
  }

  /**
   * rowKey 是否已展开，判断当前行是否是展开状态
   * @param {RowKey} rowKey
   */
  isRowExpanded(rowKey) {
    return this.expandedRowKeys.includes(this._adaptRowKey(rowKey))
  }

  /**
   * 展开/收起指定 rowKey，切换当前行展开收起状态
   * @param {RowKey} rowKey
   * @param {boolean} state
   */
  toggleRowExpansion(rowKey, state) {
    if (!rowKey) return
    rowKey = this._adaptRowKey(rowKey)

    const expandedRowKeys = this.expandedRowKeys || []
    const isExpanded = this.isRowExpanded(rowKey)
    const toggle = () => {
      if (isExpanded) {
        const childRowKeys = this.rootTreeDataAdapter
          .findNodeByKey(rowKey)
          .findChildrenLeaves()

        if (childRowKeys && childRowKeys.length) {
          for (let i = 0; i < childRowKeys.length; i++) {
            const childIndex = expandedRowKeys.indexOf(childRowKeys[i])

            if (~childIndex) {
              expandedRowKeys.splice(childIndex, 1)
            }
          }
        }

        expandedRowKeys.splice(expandedRowKeys.indexOf(rowKey), 1)
      } else {
        expandedRowKeys.push(rowKey)
      }
    }

    if (state !== undefined) {
      if (state) {
        if (!isExpanded) {
          expandedRowKeys.push(rowKey)
        }
      } else {
        if (isExpanded) {
          expandedRowKeys.splice(expandedRowKeys.indexOf(rowKey), 1)
        }
      }
    } else {
      toggle()
    }

    this.dataSource = this._updateDataSourceByKeys()
  }

  toggleExpandKeys(nextExpandedKeys) {
    this.dataSource = this._updateDataSourceByKeys(nextExpandedKeys)
  }

  /**
   * checkExpandedRowKeys
   * @param {RowKey[]} rowKeys
   */
  checkExpandedRowKeys(rowKeys) {
    const res = []
    const leaves = this.rootTreeDataAdapter.leavesNodeMap

    for (let i = 0; i < rowKeys.length; i++) {
      const rowKey = rowKeys[i]

      if (leaves[rowKey]) {
        res.push(rowKey)
      }
    }

    return res
  }

  /**
   * 展开/收起 全部
   */
  toggleExpandAll(expand) {
    const cachedKey = `expand-all:${expand}`
    let newData = (this._cached || (this._cached = {}))[cachedKey]

    if (expand) {
      if (newData) {
        return (this.dataSource = this._updateExpandKeysWithData(newData))
      } else {
        newData = []
      }

      DFSForEach(entireDataSource, (child) => {
        newData.push(child)
      })

      this.dataSource = this._cached[
        cachedKey
      ] = this._updateExpandKeysWithData(newData)
    } else {
      this.expandedRowKeys = []
      this.dataSource = this._cached[cachedKey] = entireDataSource
    }

    if (this._initialized) {
      this.defaultExpandAllRows = null
    }
  }

  /**
   * 展开指定深度层级的数据并返回
   * @param {number|boolean} depth
   */
  toggleExpandDepth(depth) {
    this.expandedRowKeys = []
    this._updateDataSourceByDepth(depth).forEach((item) => {
      if (item && item.children && item.children.length) {
        this.expandedRowKeys.push(this.getRowKey(item))
      }
    })

    this.dataSource = this._updateDataSourceByKeys()

    if (this._initialized) {
      // fix: 更新完数据之后，重置 expandDepth 回退使用 expandedKeys
      this.expandDepth = null
    }
  }

  /**
   * 根据 depth 更新 dataSource
   * @param {number|boolean} depth
   */
  _updateDataSourceByDepth(depth) {
    const cachedKey = `expand-depth:${depth}`
    let newData = (this._cached || (this._cached = {}))[cachedKey]

    if (newData) {
      return newData
    } else {
      return (this._cached[cachedKey] = genDataByDepth(
        entireDataSource,
        depth,
        0
      ))
    }
  }

  _updateExpandKeysWithData(data = []) {
    this.expandedRowKeys = []

    data.forEach((item) => {
      if (item && item.children && item.children.length) {
        this.expandedRowKeys.push(this.getRowKey(item))
      }
    })

    return data
  }

  /**
   * 根据 expandedRowKeys 更新 dataSource
   */
  _updateDataSourceByKeys(expandedRowKeys) {
    expandedRowKeys = expandedRowKeys || this.expandedRowKeys || []

    if (!expandedRowKeys.length) {
      return entireDataSource
    } else {
      const paths = []

      expandedRowKeys.forEach((key) => {
        paths.push(this.rootTreeDataAdapter.genParentPath(key))
      })

      return this._genDataSource(paths)
    }
  }

  _genDataSource(paths) {
    const generatedKeys = []
    let data

    if (paths && paths.length) {
      while (paths.length) {
        const keys = paths.shift()

        while (keys.length) {
          const key = keys.shift()

          if (!generatedKeys.includes(key)) {
            const leaf = this.rootTreeDataAdapter.findNodeByKey(key)

            if (leaf && leaf instanceof TreeDataAdapter) {
              data = leaf.genData(data)
            } else {
              // eslint-disable-next-line no-console
              console.warn(
                `This key '${key}' is not an valid instance of TreeDataAdapter`
              )

              // fix: 数据 key 更新后无法获取到正常到数据源
              data = data || []
            }

            generatedKeys.push(key)
          }
        }
      }
    }

    return data
  }

  /**
   * findRowByKey
   * @param {RowKey|Row} rowKey
   * @returns {undefined|{}}
   */
  findRowByKey(rowKey) {
    rowKey = this._adaptRowKey(rowKey)

    const cachedKey = `row-${rowKey}`
    const cached = this._cached || (this._cached = {})
    const cachedRow = cached[cachedKey]

    return (
      cachedRow ||
      (cached[cachedKey] = DFSForEach(entireDataSource, (child) => {
        if (this.getRowKey(child) === rowKey) {
          return child
        }
      }))
    )
  }

  /**
   * _adaptRowKey
   * @param {RowKey|Row} rowOrRowKey
   * @returns {number|string}
   */
  _adaptRowKey(rowOrRowKey) {
    if (rowOrRowKey && typeof rowOrRowKey === "object") {
      rowOrRowKey = this.getRowKey(rowOrRowKey)
    }

    return rowOrRowKey
  }

  /**
   * 返回随机字符串
   */
  _randomStr() {
    return Math.random()
      .toString(32)
      .slice(2)
  }

  /**
   * 判断当前行是否是选中状态
   * @param {RowKey} rowKey
   */
  isRowSelected(rowKey) {
    return (this.selectedRowKeys || []).includes(rowKey)
  }

  /**
   * 当前行是否选中状态
   * @param {RowKey} rowKey
   */
  toggleRowSelection(rowKey) {
    if (rowKey) {
      const { rowSelectionType: type, selectedRowKeys } = this

      if (type === "radio") {
        if (this.isRowSelected(rowKey)) {
          this.selectedRowKeys = []
        } else {
          this.selectedRowKeys = [rowKey]
        }
      }

      if (type === "checkbox") {
        if (selectedRowKeys.includes(rowKey)) {
          selectedRowKeys.splice(selectedRowKeys.indexOf(rowKey), 1)
        } else {
          selectedRowKeys.push(rowKey)
        }

        this.selectedRowKeys = selectedRowKeys
      }
    }
  }

  clearSideEffects() {
    _cached = null
    _rootTree = null
    entireDataSource = null
  }
}

const genDataByDepth = (children, maxDepth, currDepth = 0, data = []) => {
  let child = null

  if (currDepth >= maxDepth) return (currDepth = 0) || []

  for (let i = 0, l = children.length; i < l; i++) {
    child = children[i]
    data[data.length] = child

    if (child && child.children && child.children.length) {
      genDataByDepth(child.children, maxDepth, currDepth + 1, data)
    }
  }

  return data
}

const DFSForEach = (children, callback, depth) => {
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
