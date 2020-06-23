import { toArray } from "./type"
import { isValidElement } from "./isValidElement"

/**
 * @typedef {Vue.VNode} VNode
 * @typedef {'ltr'|'rtl'} Direction
 * @typedef {import('../types/index').ColumnConfig} ColumnConfig
 */

/**
 * flatColumns
 * @param {ColumnConfig[]} columns
 * @param {Direction} direction
 */
export function flatColumns(columns, direction) {
  // const baseColumns = columns || convertChildrenToColumns(children)
  const flattenColumns = columns.reduce((list, column) => {
    const { fixed } = column
    const finalFixed = fixed === true ? "left" : fixed
    const subColumns = column.children

    if (subColumns && subColumns.length) {
      return [
        ...list,
        ...flatColumns(subColumns).map((subColumn) => ({
          fixed: finalFixed,
          ...subColumn,
        })),
      ]
    }

    return [
      ...list,
      {
        ...column,
        fixed: finalFixed,
      },
    ]
  }, [])

  if (direction === "rtl") {
    return revertForRtl(flatColumns(flattenColumns))
  }

  // Only check out of production since it's waste for each render
  if (process.env.NODE_ENV !== "production") {
    warningFixed(flattenColumns)
  }

  return flattenColumns
}

/**
 * Convert to children `this.$slots.default` to `TableProps.columns[]`
 * @param {VNode[]} children
 * @returns {ColumnConfig[]}
 */
export function convertChildrenToColumns(children) {
  return toArray(children)
    .filter((node) => isValidElement(node))
    .map(({ key, props }) => {
      const { children: nodeChildren, ...restProps } = props
      const column = {
        key,
        ...restProps,
      }

      if (nodeChildren) {
        column.children = convertChildrenToColumns(nodeChildren)
      }

      return column
    })
}

/**
 * get per column's key
 * @param {ColumnConfig[]} columns
 * @returns {ColumnConfig[]}
 */
export function getColumnsKey(columns) {
  const columnKeys = []
  const keys = {}

  columns.forEach((column = {}, index) => {
    const { key, prop } = column
    let finalKey = (key !== undefined ? key : prop) || index

    while (keys[finalKey]) {
      finalKey = `${finalKey}_next`
    }

    keys[finalKey] = true
    columnKeys.push(finalKey)
  })

  return columnKeys
}

/**
 * getStickyOffset
 * @param {number[]} colWidths
 * @param {number} columCount
 * @param {Direction} direction
 */
export function getStickyOffset(colWidths, columCount, direction = "ltr") {
  const leftOffsets = []
  const rightOffsets = []
  let left = 0
  let right = 0

  for (let start = 0; start < columCount; start += 1) {
    if (direction === "rtl") {
      // Left offset
      rightOffsets[start] = right
      right += colWidths[start] || 0

      // Right offset
      const end = columCount - start - 1
      leftOffsets[end] = left
      left += colWidths[end] || 0
    } else {
      // Left offset
      leftOffsets[start] = left
      left += colWidths[start] || 0

      // Right offset
      const end = columCount - start - 1
      rightOffsets[end] = right
      right += colWidths[end] || 0
    }
  }

  return {
    left: leftOffsets,
    right: rightOffsets,
  }
}

/**
 * @typedef {{
 * fixLeft: number | false;
 * fixRight: number | false;
 * lastFixLeft: boolean;
 * firstFixRight: boolean;
 * lastFixRight: boolean;
 * firstFixLeft: boolean;
 * }} FixedInfo
 *
 * @typedef {{
 * left: number[];
 * right: number[];
 * }} StickyOffsets
 *
 * @param {number} colStart
 * @param {number} colEnd
 * @param {ColumnConfig[]} columns
 * @param {StickyOffsets} stickyOffsets
 * @param {Direction} direction
 *
 * @returns {FixedInfo}
 */
export function getCellFixedInfo(
  colStart,
  colEnd,
  columns,
  stickyOffsets,
  direction
) {
  const startColumn = columns[colStart] || {}
  const endColumn = columns[colEnd] || {}

  let fixLeft
  let fixRight

  if (startColumn.fixed === "left") {
    fixLeft = stickyOffsets.left[colStart]
  } else if (endColumn.fixed === "right") {
    fixRight = stickyOffsets.right[colEnd]
  }

  let lastFixLeft = false
  let firstFixRight = false

  let lastFixRight = false
  let firstFixLeft = false

  const nextColumn = columns[colEnd + 1]
  const prevColumn = columns[colStart - 1]

  if (direction === "rtl") {
    if (fixLeft !== undefined) {
      const prevFixLeft = prevColumn && prevColumn.fixed === "left"
      firstFixLeft = !prevFixLeft
    } else if (fixRight !== undefined) {
      const nextFixRight = nextColumn && nextColumn.fixed === "right"
      lastFixRight = !nextFixRight
    }
  } else if (fixLeft !== undefined) {
    const nextFixLeft = nextColumn && nextColumn.fixed === "left"
    lastFixLeft = !nextFixLeft
  } else if (fixRight !== undefined) {
    const prevFixRight = prevColumn && prevColumn.fixed === "right"
    firstFixRight = !prevFixRight
  }

  return {
    fixLeft,
    fixRight,
    lastFixLeft,
    firstFixRight,
    lastFixRight,
    firstFixLeft,
  }
}

/**
 * warningFixed
 * @param {ColumnConfig[]} flattenColumns
 */
function warningFixed(flattenColumns = []) {
  let allFixLeft = true
  for (let i = 0; i < flattenColumns.length; i += 1) {
    const col = flattenColumns[i]
    if (allFixLeft && col.fixed !== "left") {
      allFixLeft = false
    } else if (!allFixLeft && col.fixed === "left") {
      console.warn(
        `Index ${i - 1} of \`columns\` missing \`fixed='left'\` prop.`
      )
      break
    }
  }

  let allFixRight = true
  for (let i = flattenColumns.length - 1; i >= 0; i -= 1) {
    const col = flattenColumns[i]
    if (allFixRight && col.fixed !== "right") {
      allFixRight = false
    } else if (!allFixRight && col.fixed === "right") {
      console.warn(
        `Index ${i + 1} of \`columns\` missing \`fixed='right'\` prop.`
      )
      break
    }
  }
}

/**
 * revertForRtl
 * @param {ColumnConfig[]} columns
 * @returns {ColumnConfig[]}
 */
function revertForRtl(columns = []) {
  return columns.map((column) => {
    const { fixed, ...restProps } = column

    // Convert `fixed='left'` to `fixed='right'` instead
    let parsedFixed = fixed
    if (fixed === "left") {
      parsedFixed = "right"
    } else if (fixed === "right") {
      parsedFixed = "left"
    }

    return {
      fixed: parsedFixed,
      ...restProps,
    }
  })
}
