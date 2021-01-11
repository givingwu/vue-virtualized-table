import {
  flattenMap,
  flattenData,
  insertDataFromStart,
  genExpandedKeyPaths,
  findValidChildrenKeys
} from '../utils/expand'
import { isString, isNumber, isObject, isValidArray } from '../utils/type'

export function data() {
  const childrenColumnName =
    (isObject(this.expandable) && this.expandable.childrenColumnName) ||
    'children'

  this.childrenColumnName = childrenColumnName

  if (isObject(this.expandable)) {
    return {
      entireDataSource: [],
      expandedRowKeys: []
    }
  }

  return {}
}

// only watch those properties form `expandable` prop
export const watch = {
  dataSource: {
    immediate: true,
    handler(data) {
      if (!isValidArray(data)) {
        return this._clearExpansionSideEffects()
      }

      this._initDataSourceState(data)

      if (isObject(this.expandable)) {
        this.entireDataSource = this._updateDataByExpandable()
        this.expandedRowKeys = this._updateExpandedKeys()

        if (!this.__initializedEntireData) {
          this.__initializedEntireData = true
        }
      }
    }
  },

  'expandable.defaultExpandAllRows'(value) {
    this.toggleExpandAll(value)
  },

  'expandable.expandDepth'(value) {
    this.toggleExpandDepth(value)
  },

  'expandable.expandedRowKeys'(value) {
    this.toggleExpandKeys(value)
  }
}

export function created() {}

export const methods = {
  /**
   * rowKey 是否已展开，判断当前行是否是展开状态
   * @param {RowKey} rowKey
   */
  isRowExpanded(rowKey) {
    return this.expandedRowKeys.includes(this.adaptRowKey(rowKey))
  },

  /**
   * 根据传入行获取当前行的展开路径
   * @param {RowModel} record
   */
  getExpandedKeyPaths(record) {
    const rowKey = this.getRowKey(record)
    const paths = (this.flattenedPathMap || {})[rowKey]

    return isValidArray(paths)
      ? paths
      : genExpandedKeyPaths(record, this.getRowKey, this.childrenColumnName)
  },

  /**
   * 根据 key 找到当前 row 在 data 中的索引
   * @param {RowModel[]} data
   * @param {string} key
   */
  findIndexByKey(data, key) {
    return data.findIndex((item) => this.getRowKey(item) === key)
  },

  /**
   * 根据 key 找到当前 row 数据
   * @param {RowModel|string} rowOrKey
   */
  findItemByKey(rowOrKey) {
    if (isObject(rowOrKey)) return rowOrKey

    return this.flattenedData.find((item, index) => {
      if (this.getRowKey(item, index) === rowOrKey) {
        return item
      }
    })
  },

  /**
   * 适配 row key
   * @param {RowModel|string} rowOrRowKey
   * @returns {string}
   */
  adaptRowKey(rowOrRowKey) {
    if (isObject(rowOrRowKey)) {
      rowOrRowKey = this.getRowKey(rowOrRowKey)
    }

    return rowOrRowKey
  },

  /**
   * 适配 key 到 row
   * @param {RowModel|string} rowOrRowKey
   * @returns {RowModel}
   */
  adaptKeyToRow(rowOrRowKey) {
    if (rowOrRowKey && isString(rowOrRowKey)) {
      rowOrRowKey = this.findItemByKey(rowOrRowKey)
    }

    return rowOrRowKey
  },

  /**
   * 通过传入 key  获取下一个 row
   * @param {string} rowKey
   * @param {boolean} returnPrevIfNoNext
   */
  getNextItemByKey(rowKey, returnPrevIfNoNext) {
    const currIndex = this.findIndexByKey(
      this.flattenedData,
      this.adaptRowKey(rowKey)
    )
    const nextItem = this.flattenedData[currIndex + 1]

    if (nextItem) {
      return nextItem
    }

    if (returnPrevIfNoNext) {
      return this.getPrevItemByKey(rowKey, currIndex)
    }
  },

  /**
   * 通过传入 key  获取上一个 row
   * @param {string} rowKey
   * @param {number} index
   */
  getPrevItemByKey(rowKey, index) {
    const currIndex = isNumber(index)
      ? index
      : this.findIndexByKey(this.flattenedData, this.adaptRowKey(rowKey))
    const prevItem = this.flattenedData[currIndex - 1]

    if (prevItem) {
      return prevItem
    }
  },

  /**
   * 展开/收起指定 rowKey，切换当前行展开收起状态
   * @param {RowKey} rowKey
   * @param {boolean} state
   * @param {Event} event
   */
  toggleRowExpansion(rowKey, state, event) {
    if (!rowKey) return

    let record = this.adaptKeyToRow(rowKey)
    rowKey = this.adaptRowKey(record)

    const expandedRowKeys = this.expandedRowKeys
    const isExpanded = this.isRowExpanded(rowKey)
    const toggle = () => {
      if (isExpanded) {
        if (isObject(record) && isValidArray(record.children)) {
          const childRowKeys = findValidChildrenKeys(
            record.children,
            this.getRowKey,
            this.childrenColumnName
          )

          if (childRowKeys && childRowKeys.length) {
            for (let i = 0; i < childRowKeys.length; i++) {
              const childIndex = expandedRowKeys.indexOf(childRowKeys[i])

              if (~childIndex) {
                expandedRowKeys.splice(childIndex, 1)
              }
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

    this.entireDataSource = this._genDataByKeys()
    this.$emit('expand-change', record, state, expandedRowKeys, event)
  },

  /**
   * 展开/收起 全部
   * @param {boolean} expand
   */
  toggleExpandAll(expand) {
    if (expand) {
      // 展开全部 dataSource 既是展平的 flattenedData
      this.expandedRowKeys = this._genExpandedKeys(
        (this.entireDataSource = this.flattenedData)
      )
    } else {
      // 默认 dataSource 是未展开的数据所以直接赋值
      this.entireDataSource = this.dataSource
      this.expandedRowKeys = []
    }
  },

  /**
   * 展开指定深度层级的数据并返回
   * @param {number} depth
   */
  toggleExpandDepth(depth) {
    this.entireDataSource = this._genDataByDepth(depth)
    this.expandedRowKeys = this._genExpandedKeysWithDepth(
      this.entireDataSource,
      depth
    )
  },

  /**
   * 根据 nextExpandedKeys 重新生成 entireDataSource
   * @param {string[]} nextExpandedKeys
   */
  toggleExpandKeys(nextExpandedKeys) {
    this.entireDataSource = this._genDataByKeys(nextExpandedKeys)
    this.expandedRowKeys = nextExpandedKeys
  },

  _initDataSourceState(data = []) {
    if (!isValidArray(data)) {
      this.flattenedData = null
      this.flattenedPathMap = null
    } else {
      this.flattenedData = flattenData(data, this.childrenColumnName)
      this.flattenedData.forEach((item, index) => {
        item.__flatIndex = index
      })
      this.flattenedPathMap = flattenMap(
        data,
        this.getRowKey,
        this.childrenColumnName
      )

      if (process.env.NODE_ENV === 'development') {
        console.log('flattened: ', this.flattenedData, this.flattenedPathMap)
      }
    }
  },

  _updateDataByExpandable() {
    if (isValidArray(this.expandedRowKeys) || this.__initializedEntireData) {
      return this._genDataByKeys(this.expandedRowKeys)
    }

    const {
      expandDepth = null,
      expandedRowKeys = [],
      defaultExpandAllRows = null
    } = this.expandable || {}

    let entireDataSource = this.dataSource

    if (isValidArray(expandedRowKeys)) {
      entireDataSource = this._genDataByKeys(expandedRowKeys)
    } else if (defaultExpandAllRows) {
      entireDataSource = this.flattenedData || []
    } else if (expandDepth && isNumber(expandDepth)) {
      entireDataSource = this._genDataByDepth(expandDepth)
    }

    return entireDataSource
  },

  _updateExpandedKeys() {
    if (isValidArray(this.expandedRowKeys) || this.__initializedEntireData) {
      return this.expandedRowKeys
    }

    let nextExpandedRowKeys = this.expandedRowKeys

    const {
      expandDepth = null,
      expandedRowKeys = [],
      defaultExpandAllRows = null
    } = this.expandable || {}

    if (isValidArray(expandedRowKeys)) {
      nextExpandedRowKeys = expandedRowKeys
    } else if (typeof defaultExpandAllRows === 'boolean') {
      nextExpandedRowKeys = this._genExpandedKeys(this.entireDataSource)
    } else if (expandDepth && isNumber(expandDepth)) {
      nextExpandedRowKeys = this._genExpandedKeysWithDepth(
        this.entireDataSource,
        expandDepth
      )
    }

    return nextExpandedRowKeys
  },

  /**
   * _genExpandedKeys
   * @param {{}[]} data
   */
  _genExpandedKeys(data) {
    return (data || this.entireDataSource || []).reduce((keys, item, index) => {
      const children = item[this.childrenColumnName]

      if (isValidArray(children)) {
        keys = [...keys, this.getRowKey(item, index)]
      }

      return keys
    }, [])
  },

  /**
   * _genExpandedKeys
   * @param {{}[]} data
   * @param {number} depth
   */
  _genExpandedKeysWithDepth(data, depth) {
    return (data || this.entireDataSource || [])
      .filter(
        (item) =>
          item.__depth < depth && isValidArray(item[this.childrenColumnName])
      )
      .map((item, index) => this.getRowKey(item, index))
  },

  /**
   * _genDataByDepth
   * @param {number} depth
   */
  _genDataByDepth(depth) {
    return (this.flattenedData || []).filter((item) => item.__depth <= depth)
  },

  /**
   * _genDataByKeys
   * @param {(string|number)[]} keys
   */
  _genDataByKeys(keys) {
    const expandedRowKeys = keys || this.expandedRowKeys

    if (!expandedRowKeys.length) {
      return this.dataSource
    } else {
      let paths = []
      // 数据的初始形态
      let result = this.dataSource.slice()

      // 获取完整的树形路径集合
      expandedRowKeys.forEach((key) => {
        paths.push(...((this.flattenedPathMap || {})[key] || []))
      })

      // 对路径集合去重复
      paths = [...new Set(paths)]

      while (paths.length) {
        const dataIndex = this.findIndexByKey(result, paths.shift())

        if (~dataIndex) {
          const item = result[dataIndex] || {}
          const children = item[this.childrenColumnName]

          result = insertDataFromStart(result, dataIndex, children)
        }
      }

      return result
    }
  },

  _clearExpansionSideEffects() {
    this.entireDataSource = this.flattenedData = this.expandedRowKeys = []
    this.flattenedPathMap = this.__initializedEntireData = null
  }
}

export function beforeDestroy() {
  this._clearExpansionSideEffects()
}
