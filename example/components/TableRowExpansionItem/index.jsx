import './styles.css'

export default {
  name: 'TableRowExpandItem',

  props: {
    store: {
      type: Object,
      required: true
    },
    row: {
      type: Object,
      required: true
    },
    column: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      required: true
    },
    indentSize: {
      type: Number,
      default: 20,
      required: true
    }
  },

  computed: {
    className() {
      return this.expanded ? 'el-icon-minus' : 'el-icon-plus'
    },
    expanded() {
      return this.store.isRowExpanded(this.row)
    },
    title() {
      return '点击' + (this.expanded ? '收起' : '展开')
    },
    style() {
      return {
        marginLeft: this.indentSize * this.depth + 'px'
      }
    }
  },

  methods: {
    handleExpand(e) {
      e.preventDefault()
      e.stopPropagation()

      this.store.toggleRowExpansion(this.row)
    }
  },

  render() {
    return (
      <div
        class="expand-icon"
        style={this.style}
        title={this.title}
        onClick={this.handleExpand}
      >
        <span class={['icon', this.className]}></span>
      </div>
    )
  }
}
