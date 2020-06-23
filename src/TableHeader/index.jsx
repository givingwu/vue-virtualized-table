/* eslint-disable vue/require-default-prop */
import { TableProps } from '../interface'
import { isNumber } from '../utils/type'
import HeaderRow from './HeaderRow'

function parseHeaderRows(rootColumns) {
  const rows = []

  function fillRowCells(columns = [], colIndex, rowIndex = 0) {
    // Init rows
    rows[rowIndex] = rows[rowIndex] || []

    let currentColIndex = colIndex
    const colSpans = columns.map((column) => {
      const cell = {
        key: column.key,
        className: column.className || '',
        children: column.title,
        column,
        colStart: currentColIndex
      }

      let colSpan = 1

      const subColumns = column.children
      if (subColumns && subColumns.length > 0) {
        colSpan = fillRowCells(
          subColumns,
          currentColIndex,
          rowIndex + 1
        ).reduce((total, count) => total + count, 0)
        cell.hasSubColumns = true
      }

      if ('colSpan' in column && isNumber(column.colSpan)) {
        // eslint-disable-next-line no-extra-semi
        ;({ colSpan } = column)
      }

      if ('rowSpan' in column && isNumber(column.rowSpan)) {
        cell.rowSpan = column.rowSpan
      }

      cell.colSpan = colSpan
      cell.colEnd = cell.colStart + colSpan - 1
      rows[rowIndex].push(cell)

      currentColIndex += colSpan

      return colSpan
    })

    return colSpans
  }

  // Generate `rows` cell data
  fillRowCells(rootColumns, 0)

  // Handle `rowSpan`
  const rowCount = rows.length

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    rows[rowIndex].forEach((cell) => {
      if (!('rowSpan' in cell) && !cell.hasSubColumns) {
        // eslint-disable-next-line no-param-reassign
        cell.rowSpan = rowCount - rowIndex
      }
    })
  }

  return rows
}

export default {
  name: 'Header',

  functional: true,

  inheritAttrs: false,

  inject: {
    prefixCls: TableProps.prefixCls,
    components: TableProps.components
  },

  props: {
    columns: TableProps.columns,
    flattenColumns: TableProps.columns,
    stickyOffsets: Object
  },

  render(h, ctx) {
    const { props, injections } = ctx
    const { prefixCls, components } = injections
    const { columns, flattenColumns, stickyOffsets } = props

    const rows = parseHeaderRows(columns)
    const {
      wrapper: WrapperComponent,
      row: trComponent,
      cell: thComponent
    } = components.header

    return (
      <WrapperComponent class={`${prefixCls}-thead`}>
        {rows.map((row, rowIndex) => {
          const rowNode = (
            <HeaderRow
              key={rowIndex}
              flattenColumns={flattenColumns}
              cells={row}
              stickyOffsets={stickyOffsets}
              rowComponent={trComponent}
              cellComponent={thComponent}
              index={rowIndex}
            />
          )

          return rowNode
        })}
      </WrapperComponent>
    )
  }
}
