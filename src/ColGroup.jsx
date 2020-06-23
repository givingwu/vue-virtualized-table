/* eslint-disable vue/require-default-prop */
// Forked form https://github.com/react-component/table/blob/master/src/ColGroup.tsx
import { isNumber } from './utils/type'
import { TableProps } from './interface'

export default {
  name: 'ColGroup',
  functional: true,
  props: {
    colWidths: Array,
    columns: TableProps.columns
  },

  render(h, { props }) {
    const { colWidths = [], columns = [] } = props
    const cols = []
    const len = columns.length

    // Only insert col with width & additional props
    // Skip if rest col do not have any useful info
    let mustInsert = false
    for (let i = len - 1; i >= 0; i -= 1) {
      let width = colWidths[i] || (columns[i] || {}).width
      width = isNumber(width) || isNumber(+width) ? width + 'px' : width

      const column = columns && columns[i]
      // const additionalProps = column && column[INTERNAL_COL_DEFINE]

      if (width || /* additionalProps || */ mustInsert) {
        cols.unshift(
          <col
            key={i}
            style={{ width, minWidth: width }}
            data-prop={column.prop}
            // {...additionalProps}
          />
        )
        mustInsert = true
      }
    }

    return <colgroup>{cols}</colgroup>
  }
}
