/* eslint-disable vue/require-default-prop */
import PropTypes from "vue-types"
import { TableComponents, Store, TableProps } from "./interface"
import { withStoreConnect } from "./helpers/withStoreConnect"

function getRowHeight(state, props) {
  const { fixedColumnsHeadRowsHeight } = state
  const { columns, rows, fixed } = props
  const headerHeight = fixedColumnsHeadRowsHeight[0]

  if (!fixed) {
    return null
  }

  if (headerHeight && columns) {
    if (headerHeight === "auto") {
      return "auto"
    }

    return `${headerHeight / rows.length}px`
  }

  return null
}

function connect(state, props) {
  return {
    height: getRowHeight(state, props),
  }
}

export default {
  name: "TableHeaderRow",

  mixins: [withStoreConnect(connect)],

  inheritAttrs: false,

  inject: {
    table: { default: () => ({}) },
  },

  props: {
    fixed: TableProps.fixed,
    store: Store.isRequired,
    rows: TableProps.columns,
    columns: TableProps.columns,
    row: PropTypes.array,
    prefixCls: PropTypes.string.isRequired,
    components: TableComponents,
  },

  data() {
    const { stateManager } = this.table

    if (stateManager) {
      this.stateManager = stateManager
    }

    return {}
  },

  render(h) {
    const { row, fixed, prefixCls, components } = this.$props
    const { row: TableHeaderRow, cell: TableHeaderRowCell } = components.header
    const { height } = this.state
    const style = { height }

    return (
      <TableHeaderRow style={style}>
        {row.map((cell, index) => {
          // eslint-disable-next-line no-unused-vars
          const { column, children, className, ...cellProps } = cell
          const headerCellProps = {
            inheritAttrs: false,
            attrs: {
              ...cellProps,
            },
            style,
            class: [
              column.fixed && !fixed
                ? [`${prefixCls}-fixed-columns-in-body`]
                : "",
            ],
          }

          headerCellProps.class = [
            ...headerCellProps.class,
            column.ellipsis
              ? `${prefixCls}-row-cell-ellipsis`
              : `${prefixCls}-row-cell-break-word`,
          ]

          if (column.align) {
            headerCellProps.style = {
              ...headerCellProps.style,
              textAlign: column.align,
            }
          }

          if (typeof TableHeaderRowCell === "function") {
            return TableHeaderRowCell(h, headerCellProps, children)
          }

          return (
            <TableHeaderRowCell
              key={column.key || column.label || index}
              {...headerCellProps}
            >
              <span class={`${prefixCls}-header-column`}>
                {typeof column.renderHeader === "function"
                  ? column.renderHeader(h, {
                      store: this.stateManager,
                      row,
                      column,
                      index,
                    })
                  : children}
              </span>
            </TableHeaderRowCell>
          )
        })}
      </TableHeaderRow>
    )
  },
}
