/**
 * getRowKeyFn
 * @param {import('../types/index').RowModel} row
 * @param {number|undefined} index
 * @param {string} rowKey
 * @returns {string|number}
 */
export const getRowKey = (row, index, rowKey = '') => {
  let key

  if (!rowKey) {
    throw new Error('rowKey is required when get row identity')
  }

  if (!row) throw new Error('row is required when get row identity')

  if (typeof rowKey === 'string') {
    if (rowKey.indexOf('.') < 0) {
      key = row[rowKey]
      key = +key || key // when number type
    }

    let keyStr = rowKey.split('.')
    let current = row

    for (let i = 0; i < keyStr.length; i++) {
      current = current[keyStr[i]]
    }

    key = current
  } else if (typeof rowKey === 'function') {
    key = rowKey(row, index)
  }

  return key === undefined ? index : key
}
