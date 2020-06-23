/* eslint-disable vue/require-default-prop */
import { OBJECT_PROP } from '../interface'
import {
  isArray,
  isString,
  isNumber,
  isObject,
  isFunction
} from '../utils/type'

export default {
  name: 'Cell',

  functional: true,

  inject: {
    store: OBJECT_PROP,
    rowHeight: {
      type: [String, Number]
    }
  },

  props: {
    prefixCls: String,
    record: Object,
    column: Object,
    /** `record` index. Not `column` index. */
    index: Number,
    prop: String,
    component: String,
    children: [Array, Object],
    colSpan: Number,
    rowSpan: Number,
    ellipsis: Boolean,
    align: String,

    shouldCellUpdate: Function,

    // Fixed
    fixLeft: [Number, Boolean],
    fixRight: [Number, Boolean],
    firstFixLeft: Boolean,
    lastFixLeft: Boolean,
    firstFixRight: Boolean,
    lastFixRight: Boolean,

    // Additional
    /** @private Used for `expandable` with nest tree */
    appendNode: [Object, Array],
    rowType: String // 'header' | 'body' | 'footer',
  },

  render(h, { props, injections }) {
    const {
      index,
      column,
      prefixCls,
      record = {},
      prop = '',
      children,
      component: Component = 'td',
      colSpan,
      rowSpan,
      fixLeft,
      fixRight,
      firstFixLeft,
      lastFixLeft,
      firstFixRight,
      lastFixRight,
      appendNode,
      additionalProps = {},
      ellipsis,
      align,
      rowType
    } = props
    const { store, rowHeight } = injections
    const isHeader = rowType === 'header'
    const cellPrefixCls = `${prefixCls}-cell`
    const value = record[prop]
    let childNode = children || value || ''

    if (isHeader) {
      if (isObject(column) && isFunction(column.renderHeader)) {
        childNode = column.renderHeader(h, {
          store: store,
          row: record,
          column,
          value,
          index
        })
      }
    } else {
      if (isObject(column) && isFunction(column.render)) {
        childNode = column.render(h, {
          store: store,
          value,
          row: record,
          column,
          index
        })
      }
    }

    if (ellipsis && (lastFixLeft || firstFixRight)) {
      childNode = <span class={`${cellPrefixCls}-content`}>{childNode}</span>
    }

    const fixedStyle = {}
    const isFixLeft = typeof fixLeft === 'number'
    const isFixRight = typeof fixRight === 'number'

    if (isFixLeft) {
      fixedStyle.position = 'sticky'
      fixedStyle.left = fixLeft + 'px'
    }

    if (isFixRight) {
      fixedStyle.position = 'sticky'
      fixedStyle.right = fixRight + 'px'
    }

    const alignStyle = {}
    if (align) {
      alignStyle.textAlign = align
    }

    let title
    const ellipsisConfig = ellipsis === true ? { showTitle: true } : ellipsis

    if (ellipsisConfig && (ellipsisConfig.showTitle || isHeader)) {
      if (childNode && isArray(childNode) && childNode.length === 1) {
        childNode = childNode[0]
      }

      if (typeof childNode === 'string' || typeof childNode === 'number') {
        title = childNode.toString()
      }

      if (!isString('' + title)) {
        title = record[prop] || ''
      }
    }

    if (colSpan === 0 || rowSpan === 0) {
      return null
    }

    const componentProps = {
      attrs: {
        title,
        ...additionalProps,
        colSpan: colSpan !== 1 ? colSpan : null,
        rowSpan: rowSpan !== 1 ? rowSpan : null
      },
      class: [
        cellPrefixCls,
        // column ? [column.class, column.className] : [],
        {
          [`${cellPrefixCls}-fix-left`]: isFixLeft,
          [`${cellPrefixCls}-fix-left-first`]: firstFixLeft,
          [`${cellPrefixCls}-fix-left-last`]: lastFixLeft,
          [`${cellPrefixCls}-fix-right`]: isFixRight,
          [`${cellPrefixCls}-fix-right-first`]: firstFixRight,
          [`${cellPrefixCls}-fix-right-last`]: lastFixRight,
          [`${cellPrefixCls}-ellipsis`]: ellipsis,
          [`${cellPrefixCls}-with-append`]: appendNode
        }
      ],
      style: {
        ...additionalProps.style,
        ...alignStyle,
        ...fixedStyle,
        height: !isHeader && isNumber(+rowHeight) ? rowHeight + 'px' : rowHeight
      },
      ref: null
    }

    return (
      <Component {...componentProps}>
        {appendNode}
        {childNode}
      </Component>
    )
  }
}
