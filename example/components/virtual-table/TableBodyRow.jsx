/* eslint-disable vue/require-default-prop */
import PropTypes from 'vue-types'
import { withStoreConnect } from './helpers/withStoreConnect'
import { ColumnProps, TableComponents, TableProps } from './interface'

function getRowHeight(state, props) {
  const { /* expandedRowsHeight,  */ fixedColumnsBodyRowsHeight } = state
  const { fixed, rowKey } = props

  if (!fixed) {
    return null
  }

  if (fixedColumnsBodyRowsHeight && fixedColumnsBodyRowsHeight[rowKey]) {
    return fixedColumnsBodyRowsHeight[rowKey]
  }

  return null
}

function connect(state, props) {
  const { currentHoveredKey /* , expandedRowKeys */ } = state
  const { rowKey /* , ancestorKeys */ } = props
  // const visible =
  //   (ancestorKeys && ancestorKeys.length === 0) ||
  //   ancestorKeys.every((k) => ~expandedRowKeys.indexOf(k))

  return {
    // visible,
    hovered: currentHoveredKey === rowKey,
    height: getRowHeight(state, props)
  }
}

function getSpan(row, column, key) {
  let span = column[key]

  if (typeof span === 'function') {
    span = span(row)
  }

  if (typeof span === 'number') {
    return span
  }
}

export default {
  name: 'TableBodyRow',

  mixins: [withStoreConnect(connect)],

  props: {
    // store: Store.isRequired,
    fixed: ColumnProps.fixed.def(false),
    row: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    columns: PropTypes.arrayOf(ColumnProps).isRequired,
    prefixCls: PropTypes.string.isRequired,
    useVirtual: TableProps.useVirtual,
    components: TableComponents
  },

  inject: {
    table: { default: () => ({}) }
  },

  data() {
    const { store, stateManager, columnManager } = this.table

    if (store) {
      this.store = store
    }

    if (stateManager) {
      this.stateManager = stateManager
    }

    if (columnManager) {
      this.columnManager = columnManager
    }

    return {}
  },

  mounted() {
    this.$nextTick(() => {
      this.saveRowRef()
    })
  },

  updated() {
    if (!this.rowRef) {
      this.$nextTick(() => {
        this.saveRowRef()
      })
    }
  },

  methods: {
    $$emit() {
      // 直接调用listeners，底层组件不需要vueTool记录events
      const args = [].slice.call(arguments, 0)
      const filterEvent = []
      const eventName = args[0]

      if (args.length && this.$listeners[eventName]) {
        if (filterEvent.includes(eventName)) {
          this.$emit(eventName, ...args.slice(1))
        } else {
          this.$listeners[eventName](...args.slice(1))
        }
      }
    },

    saveRowRef() {
      this.rowRef = this.$el

      if (!this.columnManager.isAnyColumnsFixed()) {
        return
      }

      if (!this.useVirtual && !this.fixed) {
        this.setRowHeight()
      }
    },

    setRowHeight() {
      const { fixedColumnsBodyRowsHeight } = this.store.getState()
      const height = this.rowRef.getBoundingClientRect().height

      this.store.setState({
        fixedColumnsBodyRowsHeight: {
          ...fixedColumnsBodyRowsHeight,
          [this.rowKey]: height
        }
      })
    },

    handleRowHover(isHover, key) {
      this.store.setState({
        currentHoveredKey: isHover ? key : null
      })
    },

    handleRowExpand(event) {
      this.stateManager.toggleRowExpansion(this.rowKey)
      this.$emit(
        'expand-change',
        this.rowKey,
        this.stateManager.isRowExpanded(this.rowKey),
        this.stateManager.expandedRowKeys,
        event
      )
    },

    onRowClick(event) {
      const { row: record } = this

      if (this.stateManager.rowSelectionType) {
        this.stateManager.toggleRowSelection(this.rowKey)
      }

      // 隐式(不被vue-devtools工具记录)事件如果存在handler将直接执行
      this.$$emit('rowClick', record, event)
      // 显式(被vue-devtools工具记录)抛出的事件
      this.$emit(
        'select-change',
        record,
        this.stateManager.isRowSelected(this.rowKey),
        this.stateManager.selectedRowKeys,
        event
      )
    },

    onRowDoubleClick(event) {
      const { row: record } = this

      this.$$emit('rowDoubleClick', record, event)
    },

    onContextMenu(event) {
      const { row: record } = this

      this.$$emit('rowContextmenu', record, event)
    },

    onMouseEnter(event) {
      const { row: record, rowKey } = this

      this.handleRowHover(true, rowKey)

      this.$$emit('hover', true, rowKey)
      this.$$emit('rowMouseenter', record, event)
    },

    onMouseLeave(event) {
      const { row: record, rowKey } = this

      this.handleRowHover(false, rowKey)

      this.$$emit('hover', false, rowKey)
      this.$$emit('rowMouseleave', record, event)
    }
  },

  render(h) {
    const { rowHeight, indentSize, expandIcon, useVirtualScroll } = this.table
    const { columns, row, fixed, rowKey, prefixCls, components } = this.$props
    let rows = columns

    if (fixed) {
      if (fixed === 'right') {
        rows = this.columnManager.rightLeafColumns()
      } else {
        rows = this.columnManager.leftLeafColumns()
      }
    } else {
      rows = this.columnManager.leafColumns()
    }

    const { row: TableBodyRow, cell: TableBodyRowCell } = components.body || {}
    const { height, hovered } = this.state
    const isSelected = this.stateManager.isRowSelected(this.rowKey)
    const isExpanded = this.stateManager.isRowExpanded(this.rowKey)
    const hasChildren = row.children && row.children.length

    let maxHeight = useVirtualScroll ? Math.max(rowHeight, height) : height
    maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight

    const style = {
      height: maxHeight
    }

    /* if (useVirtualScroll) {
      style.maxHeight = maxHeight
      // 取消任何高度比例扩张
      style.lineHeight = 1
      style.overflow = 'hidden'
    } */

    const bodyRowProps = {
      on: {
        click: this.onRowClick,
        dblclick: this.onRowDoubleClick,
        mouseenter: this.onMouseEnter,
        mouseleave: this.onMouseLeave,
        contextmenu: this.onContextMenu
      },
      class: {
        [`${prefixCls}-row`]: true,
        [`${prefixCls}-row-hover`]: hovered,
        [`${prefixCls}-row-selected`]: isSelected,
        [`${prefixCls}-table-expanded-row`]: isExpanded
      },
      style,
      attrs: {
        'data-row-key': rowKey
      }
    }

    return (
      <TableBodyRow {...bodyRowProps}>
        {rows.map((column, columnIndex) => {
          let value = row[column.prop]
          let width = column.width
          width = typeof width === 'number' ? `${width}px` : width

          const colspan = getSpan(row, column, 'colspan')
          const rowspan = getSpan(row, column, 'rowspan')

          const expandable = column.expandable
          const cellProps = {
            key: column.key || column.label || columnIndex,
            style: {
              ...style,
              width,
              maxWidth: width
            },
            attrs: {
              colspan,
              rowspan
            },
            class: [
              column.fixed && !fixed
                ? [
                    `${prefixCls}-fixed-columns-in-body`,
                    column.className || column.class
                  ]
                : column.className || column.class,
              column.ellipsis
                ? `${prefixCls}-row-cell-ellipsis`
                : `${prefixCls}-row-cell-break-word`,
              column.class
            ]
          }

          if (
            value &&
            typeof value === 'string' &&
            value !== 'null' &&
            isNaN(+value)
          ) {
            cellProps.domProps = {
              title: value
            }
          }

          let customCellRender
          let expandRenders = []

          if (useVirtualScroll && column.fixed && !fixed) {
            value = ''
          } else {
            if (column.align) {
              cellProps.style = {
                // ...style,
                textAlign: column.align
              }
            }

            if (typeof column.render === 'function') {
              customCellRender = column.render(h, {
                store: this.stateManager,
                row,
                rowKey: rowKey,
                index: this.index,
                column,
                columnIndex
              })
            }
          }

          if (expandable) {
            const depth = row.__depth
            const gap = depth * indentSize
            const style = {
              paddingLeft: gap + (hasChildren ? 0 : indentSize + 5) + 'px'
            }

            expandRenders = [
              <div
                class={`${prefixCls}-row-indent indent-level-${depth}`}
                style={style}
              ></div>
            ]

            if (expandIcon) {
              expandRenders.push(
                typeof expandIcon === 'function'
                  ? expandIcon(isExpanded, depth, indentSize)
                  : expandIcon
              )
            } else {
              expandRenders.push(
                <div
                  role="button"
                  tabindex="0"
                  class={
                    hasChildren && [
                      `${prefixCls}-row-expand-icon`,
                      isExpanded
                        ? `${prefixCls}-row-expanded`
                        : `${prefixCls}-row-collapsed`
                    ]
                  }
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} row`}
                  onClick={this.handleRowExpand}
                ></div>
              )
            }
          }

          return (
            <TableBodyRowCell {...cellProps}>
              {expandRenders}
              {column.render ? customCellRender : value}
            </TableBodyRowCell>
          )
        })}
      </TableBodyRow>
    )
  }
}
