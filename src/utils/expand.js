/* eslint-disable no-undef */
import { isArray, isValidArray, isObject } from './type'

/**
 * findAllChildrenKeys
 * @param {Tree[]} data
 * @param {GetRowKey} getRowKey
 * @param {string} childrenColumnName
 * @returns {string[]}
 */
export function findValidChildrenKeys(data, getRowKey, childrenColumnName) {
  return data.reduce((keys, item, index) => {
    const key = getRowKey(item, index)
    const children = item[childrenColumnName]

    if (isValidArray(children)) {
      return [
        key,
        ...findValidChildrenKeys(children, getRowKey, childrenColumnName),
        ...keys
      ]
    }

    return keys
  }, [])
}

/**
 * flatten tree data 展开树形数据
 *
 * @typedef {import("../types/index").RowModel} RowModel
 * @typedef {(item: object, index: number)=>string} GetRowKey
 * @typedef Tree
 * @property {string|number} [key]
 * @property {Tree[]} [children]
 *
 * @param {Tree[]} tree
 * @param {string} childrenColumnName
 * @param {number} [depth]
 * @param {RowModel[]} [flatten]
 * @param {RowModel} [parent]
 */
export function flattenData(
  tree,
  childrenColumnName,
  depth = 0,
  flatten = [],
  parent = null
) {
  for (let index = 0; index < tree.length; index++) {
    const item = tree[index]
    const children = item[childrenColumnName]
    const hasNestChildren = isValidArray(children)

    // record the depth number
    if (!item.__depth || item.__depth !== depth) {
      item.__depth = depth
    }

    // record the index number
    if (!item.__index || item.__index !== index) {
      item.__index = index
    }

    // record the parent ref
    if (parent && (!item.__parent || item.__parent !== parent)) {
      item.__parent = parent
    }

    flatten.push(item)

    if (hasNestChildren) {
      flattenData(children, childrenColumnName, depth + 1, flatten, item)
    }
  }

  return flatten
}

/**
 * flattenMap 记录当前 rowKey 的 tree-paths
 *
 * @param {Tree[]} tree
 * @param {(item: RowModel, index: number)=> string} getRowKey
 * @param {string} childrenColumnName
 * @param {string[]} prefix
 * @param {Object<string, string[]>} preset
 */
export function flattenMap(
  tree = [],
  getRowKey,
  childrenColumnName,
  prefix = [],
  preset = {}
) {
  return tree.reduce((prev, item, index) => {
    const children = item[childrenColumnName]
    const hasNestChildren = isValidArray(children)

    if (hasNestChildren) {
      const key = getRowKey(item, index)
      const path = prefix.length ? [...prefix, key] : [key]

      prev[key] = path

      return flattenMap(children, getRowKey, childrenColumnName, path, prev)
    }

    return prev
  }, preset)
}

/**
 * genExpandedKeyPaths
 * @param {RowModel} record
 * @param {(row: object, index: number)=>string} getRowKey
 * @param {string} childrenColumnName
 * @param {*} rowKey
 */
export function genExpandedKeyPaths(record, getRowKey, childrenColumnName) {
  let parent = record.__parent
  let results = isValidArray(record[childrenColumnName])
    ? [getRowKey(item)]
    : []

  while (isObject(parent)) {
    results = [getRowKey(parent), ...results]
    parent = parent.__parent
  }

  return results
}

/**
 * insertDataFromStart
 * @param {[]} data
 * @param {number} startIndex
 * @param {[]} middle
 */
export function insertDataFromStart(
  data, // any[]
  startIndex = -1, // number
  middle = [] // any[]
) {
  if (!isArray(data) || !isArray(middle)) throw new TypeError()

  const left = data.slice(0, startIndex + 1)
  const right = data.slice(startIndex + 1)

  return [...left, ...middle, ...right]
}

/**
 * renderExpandIcon
 * @typedef {{
 *  prefixCls: string,
    record: object,
    onExpand: function,
    expanded: boolean,
    expandable: boolean,
 * }} ExpandConfig
 * @param {import("@/components/virtualized-table/utils/vue").CreateElement} h
 * @param {ExpandConfig} expandConfig
 */
export const renderExpandIcon = (
  h,
  { prefixCls, record, onExpand, expanded, expandable }
) => {
  const iconPrefix = `${prefixCls}-row-expand-icon`

  return (
    <button
      type="button"
      onClick={(e) => {
        onExpand(record, e)
        e.stopPropagation()
      }}
      class={[
        iconPrefix,
        {
          [`${iconPrefix}-spaced`]: !expandable,
          [`${iconPrefix}-expanded`]: expandable && expanded,
          [`${iconPrefix}-collapsed`]: expandable && !expanded
        }
      ]}
      aria-label={expanded ? `collapse` : `expand`}
    />
  )
}
