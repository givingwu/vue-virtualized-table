/* eslint-disable vue/require-default-prop */
import Cell from '../TableCell/index'

export default {
  name: 'ExpandedRow',

  functional: true,

  inheritAttrs: false,

  inject: ['scrollbarSize'],

  props: {
    prefixCls: String,
    component: String,
    cellComponent: String,
    fixHeader: Boolean,
    fixColumn: Boolean,
    horizonScroll: Boolean,
    componentWidth: Number,
    className: String,
    expanded: Boolean,
    children: [Object, Array],
    colSpan: Number
  },

  render(h, { props, children, injections }) {
    const {
      prefixCls,
      children: propsChildren,
      component: Component,
      cellComponent,
      fixHeader,
      fixColumn,
      className,
      expanded,
      colSpan,
      scrollbarSize,
      componentWidth
    } = {
      ...props,
      ...injections
    }
    let contentNode = children || propsChildren

    if (fixColumn && componentWidth) {
      contentNode = (
        <div
          style={{
            width: componentWidth - (fixHeader ? scrollbarSize : 0) + 'px',
            position: 'sticky',
            left: 0,
            overflow: 'hidden'
          }}
          class={`${prefixCls}-expanded-row-fixed`}
        >
          {contentNode}
        </div>
      )
    }

    return (
      <Component
        class={className}
        style={{
          display: expanded ? null : 'none'
        }}
      >
        <Cell
          children={contentNode}
          component={cellComponent}
          prefixCls={prefixCls}
          colSpan={colSpan}
        >
          {contentNode}
        </Cell>
      </Component>
    )
  }
}
