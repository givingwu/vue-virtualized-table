/* eslint-disable vue/require-default-prop */
import PropTypes from 'vue-types'
import TableHeaderRow from './TableHeaderRow'
import { ColumnProps, TableComponents, TableProps } from './interface'

function getHeaderRows(columns, currentRow = 0, rows) {
  rows = rows || []
  rows[currentRow] = rows[currentRow] || []

  columns.forEach((column) => {
    if (column.rowSpan && rows.length < column.rowSpan) {
      while (rows.length < column.rowSpan) {
        rows.push([])
      }
    }

    const cell = {
      key: column.key,
      className: column.className || column.class || '',
      children: column.label || column.title,
      column
    }

    if (column.children) {
      getHeaderRows(column.children, currentRow + 1, rows)
    }

    if ('colSpan' in column) {
      cell.colSpan = column.colSpan
    }

    if ('rowSpan' in column) {
      cell.rowSpan = column.rowSpan
    }

    if (cell.colSpan !== 0) {
      rows[currentRow].push(cell)
    }
  })

  return rows.filter((row) => row.length > 0)
}

export default {
  name: 'TableHeader',

  inheritAttrs: false,

  props: {
    fixed: ColumnProps.fixed.def(false),
    columns: PropTypes.arrayOf(ColumnProps).isRequired,
    prefixCls: TableProps.prefixCls,
    components: TableComponents
  },

  render() {
    const { fixed, columns, prefixCls, components } = this
    const TableHeaderWrapper = components.header.wrapper
    const rows = getHeaderRows(columns)

    return (
      <TableHeaderWrapper class={`${prefixCls}-thead`}>
        {rows.map((row, index) => {
          const attrs = {
            key: index,
            props: {
              ...this.$attrs,
              row,
              index,
              prefixCls,
              components,
              fixed,
              columns,
              rows
            },
            on: {
              ...this.$listeners
            },
            attrs: {
              ...this.$attrs
            }
          }

          return <TableHeaderRow {...attrs}></TableHeaderRow>
        })}
      </TableHeaderWrapper>
    )
  }
}
