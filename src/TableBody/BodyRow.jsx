/* eslint-disable vue/require-default-prop */
import {
  noop,
  isObject,
  isNumber,
  isFunction,
  isValidArray
} from '../utils/type'
import TableCell from '../TableCell/index'
import { renderExpandIcon } from '../utils/expand'
import { TableProps, ARRAY_PROP, OBJECT_PROP } from '../interface'

function getSpan(row, index, span) {
  if (isFunction(span)) {
    span = span(row, index)
  }

  if (isNumber(span)) {
    return span
  }

  return 1
}

export default {
  name: 'BodyRow',

  // functional: true,

  inheritAttrs: false,

  inject: {
    store: OBJECT_PROP,
    prefixCls: TableProps.prefixCls,
    expandable: OBJECT_PROP,
    rowSelection: OBJECT_PROP,
    rowClassName: TableProps.rowClassName
    // isSelectionMode: Boolean,
    // isExpansionMode: Boolean,
  },

  props: {
    index: Number,
    rowKey: [String, Number],
    record: Object,
    columnsKey: ARRAY_PROP,
    recordKey: [String, Number],
    expandedKeys: Array,
    rowComponent: String,
    cellComponent: String,
    fixedInfoList: ARRAY_PROP,
    flattenColumns: TableProps.columns,
    childrenColumnName: String
  },

  render(h /* { props, injections } */) {
    const {
      record,
      index,
      rowKey,
      columnsKey,
      expandedKeys,
      rowComponent: RowComponent,
      cellComponent,
      fixedInfoList,
      flattenColumns,
      childrenColumnName
    } = this.$props

    const { store, prefixCls, expandable, rowClassName, rowSelection } = this // .injections

    const hasNestChildren =
      childrenColumnName && record && isValidArray(record[childrenColumnName])
    let expanded = false
    let onExpand = noop
    let indent = 0

    if (isObject(expandable)) {
      indent = record.__depth || 0
      expanded = expandedKeys.includes(rowKey)
      onExpand = (record, event) => {
        store.toggleRowExpansion(record, undefined, event)
      }
    }

    let selected = null
    let onClick = noop

    if (rowSelection) {
      selected = store.isRowSelected(rowKey)
      onClick = (event) => store.toggleRowSelection(record, event)
    }

    let computeRowClassName

    if (typeof rowClassName === 'string') {
      computeRowClassName = rowClassName
    } else if (typeof rowClassName === 'function') {
      computeRowClassName = rowClassName(record, index, indent)
    }

    return (
      <RowComponent
        data-row-key={rowKey}
        class={[
          `${prefixCls}-row`,
          `${prefixCls}-row-level-${indent}`,
          selected && `${prefixCls}-row-selected`,
          computeRowClassName
        ]}
        onClick={onClick}
      >
        {flattenColumns.map((column, colIndex) => {
          const { prop, className: columnClassName } = column

          const key = (columnsKey || [])[colIndex]
          const fixedInfo = fixedInfoList[colIndex]

          // ============= Used for nest expandable =============
          let appendCellNode

          if (
            column.expandable &&
            isObject(expandable) &&
            isFunction(onExpand)
          ) {
            appendCellNode = [
              <span
                style={{
                  paddingLeft: `${(expandable.indentSize || 15) * indent}px`
                }}
                class={`${prefixCls}-row-indent indent-level-${indent}`}
              />,
              (isFunction(expandable.expandIcon)
                ? expandable.expandIcon
                : renderExpandIcon)(h, {
                prefixCls,
                expanded,
                expandable: isFunction(expandable.rowExpandable)
                  ? expandable.rowExpandable(record, index, rowKey)
                  : record.hasChildren || hasNestChildren,
                record,
                onExpand
              })
            ]
          }

          return (
            <TableCell
              key={key}
              class={columnClassName}
              index={index}
              record={record}
              prop={prop}
              colSpan={getSpan(record, index, column.colSpan)}
              rowSpan={getSpan(record, index, column.rowSpan)}
              column={column}
              ellipsis={column.ellipsis}
              align={column.align}
              component={cellComponent}
              prefixCls={prefixCls}
              shouldCellUpdate={column.shouldCellUpdate}
              appendNode={appendCellNode}
              {...{ props: fixedInfo }}
            />
          )
        })}
      </RowComponent>
    )
  }
}
