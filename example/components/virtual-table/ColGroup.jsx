/* eslint-disable vue/require-default-prop */
import PropTypes from 'vue-types'
import { ColumnProps } from './interface'

export default {
  name: 'ColGroup',

  props: {
    fixed: ColumnProps.fixed,
    columns: PropTypes.arrayOf(ColumnProps).isRequired
  },

  inject: {
    table: { default: () => ({}) }
  },

  watch: {
    // FIXME: columns 属性变化未触发 render，所以使用了 $forceUpdate，应该有更好的方法。
    // 比如说使用 createStore
    columns(val, oldVal) {
      if (oldVal !== val || oldVal.length !== val.length) {
        this.$forceUpdate()
      }
    }
  },

  render() {
    const { fixed, table } = this
    const { prefixCls, expandIconAsCell, columnManager } = table

    let cols = []

    if (expandIconAsCell && fixed !== 'right') {
      cols.push(
        <col
          class={`${prefixCls}-expand-icon-col`}
          key="rc-table-expand-icon-col"
        />
      )
    }

    let leafColumns

    if (fixed === 'left') {
      leafColumns = columnManager.leftLeafColumns()
    } else if (fixed === 'right') {
      leafColumns = columnManager.rightLeafColumns()
    } else {
      leafColumns = columnManager.leafColumns()
    }

    cols = cols.concat(
      leafColumns.map((c) => {
        const width = typeof c.width === 'number' ? `${c.width}px` : c.width

        return (
          <col
            data-prop={c.prop}
            key={c.key || c.dataIndex}
            style={width ? { width, minWidth: width } : {}}
            width={c.width}
          />
        )
      })
    )

    return <colgroup>{cols}</colgroup>
  }
}
