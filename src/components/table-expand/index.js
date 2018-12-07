/**
 * Refs:
 * 1. https://juejin.im/post/5a2f73a3f265da432718320c
 * 2. https://segmentfault.com/q/1010000011950121
 */
export default {
  name: 'TableExpand',
  functional: true,
  props: {
    row: Object,
    render: Function,
    index: Number,
    depth: Number,
    expandDepth: Number,
    column: {
      type: Object,
      default: null,
    },
  },
  render: (h, ctx) => {
    const params = {
      // ctx,
      ...ctx.props,
    }
    // if (ctx.props.column) params.column = ctx.props.column
    return ctx.props.render(h, params)
  },
}
