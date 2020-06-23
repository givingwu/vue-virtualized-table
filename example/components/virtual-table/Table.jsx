/* eslint-disable vue/require-default-prop */
import PropTypes from 'vue-types'
import ColGroup from './ColGroup'
import TableHeader from './TableHeader'
import TableBody from './TableBody'
import { TableComponents, TableProps } from './interface'

export default {
  name: 'Table',

  props: {
    fixed: TableProps.fixed,
    prefixCls: TableProps.prefixCls,
    showHeader: PropTypes.bool.def(true),
    components: TableComponents.isRequired,
    hasHead: PropTypes.bool.def(true),
    hasBody: PropTypes.bool.def(true),
    scroll: TableProps.scroll.isRequired,
    columns: TableProps.columns.isRequired
  },

  render() {
    const {
      prefixCls,
      showHeader,
      components,
      hasHead,
      hasBody,
      fixed,
      scroll,
      columns
    } = this.$props
    const tableStyle = {}

    if (!fixed && scroll.x) {
      // not set width, then use content fixed width
      if (scroll.x === true) {
        tableStyle.tableLayout = 'fixed'
      } else {
        tableStyle.width =
          typeof scroll.x === 'number' ? `${scroll.x}px` : scroll.x
      }
    }

    const Table = hasBody ? components.table : 'table'

    return (
      <Table style={tableStyle} key="table">
        <ColGroup columns={columns} fixed={fixed} />

        {hasHead && (
          <TableHeader
            fixed={fixed}
            store={this.store}
            columns={columns}
            prefixCls={prefixCls}
            showHeader={showHeader}
            components={components}
          />
        )}

        {hasBody && (
          <TableBody
            fixed={fixed}
            store={this.store}
            rows={
              this.useVirtualScroll ? this.visibleDataRange : this.dataSource
            }
            getRowKey={this.getRowKey}
            columns={columns}
            components={components}
          ></TableBody>
        )}
      </Table>
    )
  }
}
