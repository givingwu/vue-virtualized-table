/* eslint-disable vue/require-default-prop */
import { getColumnsKey, getCellFixedInfo } from '../utils/column'
import { TableProps, STRING_PROP } from '../interface'
import Cell from '../TableCell/index'

export default {
  name: 'HeaderRow',

  functional: true,

  inheritAttrs: false,

  inject: {
    prefixCls: TableProps.prefixCls,
    direction: STRING_PROP
  },

  props: {
    cells: {
      type: Array,
      default: () => []
    },
    columns: Array,
    stickyOffsets: Object,
    flattenColumns: Array,
    rowComponent: String,
    cellComponent: String,
    index: Number
  },

  render(h, ctx) {
    const { props, injections } = ctx
    const { prefixCls, direction } = injections
    const {
      cells,
      stickyOffsets,
      flattenColumns,
      rowComponent: RowComponent,
      cellComponent: CellComponent
    } = props

    const columnsKey = getColumnsKey(cells.map((cell) => cell.column))

    return (
      <RowComponent>
        {cells.map((cell, cellIndex) => {
          const { column } = cell
          const fixedInfo = getCellFixedInfo(
            cell.colStart,
            cell.colEnd,
            flattenColumns,
            stickyOffsets,
            direction
          )

          // fix: TableHeaderRow 不渲染 className 否则样式可能引起 table 渲染异常
          cell.column = {
            ...column,
            class: '',
            className: ''
          }

          const options = {
            props: { ...cell, ...fixedInfo, children: [column.label] }
          }

          return (
            <Cell
              ellipsis={column.ellipsis}
              align={column.align}
              component={CellComponent}
              prefixCls={prefixCls}
              key={columnsKey[cellIndex]}
              rowType="header"
              {...options}
            />
          )
        })}
      </RowComponent>
    )
  }
}
