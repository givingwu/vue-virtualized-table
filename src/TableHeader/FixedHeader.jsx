/* eslint-disable vue/require-default-prop */
import Header from './index'
import ColGroup from '../ColGroup'
import { TableProps, NUMBER_PROP } from '../interface'

export default {
  name: 'FixedHeader',

  functional: true,

  inheritAttrs: false,

  inject: {
    prefixCls: TableProps.prefixCls,
    scrollbarSize: NUMBER_PROP
  },

  props: {
    colWidths: Array,
    columCount: Number,
    direction: String,
    ...Header.props
  },

  render(h, ctx) {
    const { props, injections } = ctx
    const { prefixCls, scrollbarSize } = injections
    const {
      columns,
      flattenColumns,
      colWidths,
      columCount,
      stickyOffsets,
      direction
    } = props

    // Add scrollbar column
    const lastColumn = flattenColumns[flattenColumns.length - 1]
    const ScrollBarColumn = {
      fixed: lastColumn ? lastColumn.fixed : null,
      class: `${prefixCls}-cell-scrollbar`
    }

    const columnsWithScrollbar = scrollbarSize
      ? [...columns, ScrollBarColumn]
      : columns
    const flattenColumnsWithScrollbar = scrollbarSize
      ? [...flattenColumns, ScrollBarColumn]
      : flattenColumns

    // Calculate the sticky offsets
    const { right, left } = stickyOffsets
    const headerStickyOffsets = {
      ...stickyOffsets,
      left:
        direction === 'rtl'
          ? [...left.map((width) => width + scrollbarSize), 0]
          : left,
      right:
        direction === 'rtl'
          ? right
          : [...right.map((width) => width + scrollbarSize), 0]
    }

    const cloneWidths = []
    for (let i = 0; i < columCount; i += 1) {
      cloneWidths[i] = colWidths[i]
    }
    const columnWidthsReady = !colWidths.every((width) => !width)

    return (
      <table
        style={{
          tableLayout: 'fixed',
          visibility: columnWidthsReady ? null : 'hidden'
        }}
      >
        <ColGroup
          colWidths={[...colWidths, scrollbarSize]}
          columCount={columCount + 1}
          columns={flattenColumnsWithScrollbar}
        />

        <Header
          columns={columnsWithScrollbar}
          stickyOffsets={headerStickyOffsets}
          flattenColumns={flattenColumnsWithScrollbar}
        />
      </table>
    )
  }
}
