/* eslint-disable no-unused-vars */
export const BOOLEAN_TRUE_PROP = {
  type: Boolean,
  default: true
}

export const BOOLEAN_FALSE_PROP = {
  type: Boolean,
  default: false
}

export const STRING_PROP = {
  type: String
}

export const STRING_REQUIRED_PROP = {
  ...STRING_PROP,
  required: true
}

export const NUMBER_PROP = {
  type: Number
}

export const NUMBER_REQUIRED_PROP = {
  ...NUMBER_PROP,
  required: true
}

export const FUNC_PROP = {
  type: Function
}

export const OBJECT_PROP = {
  type: Object
}

export const ARRAY_PROP = {
  type: Array
}

export const TableComponents = {
  table: 'table',
  header: {
    wrapper: 'thead',
    row: 'tr',
    cell: 'th'
  },
  body: {
    wrapper: 'tbody',
    row: 'tr',
    cell: 'td'
  }
}

const DEFAULT_LOCALE = {
  emptyText: '暂无数据'
}

export const SINGLE_SELECTION_MODE = 'radio'
export const MULTIPLE_SELECTION_MODE = 'checkbox'

// TODO: Will it be used?
export const rowSelection = {
  type: {
    type: String,
    default: SINGLE_SELECTION_MODE,
    validator(val) {
      return [SINGLE_SELECTION_MODE, MULTIPLE_SELECTION_MODE].includes(val)
    }
  },
  // Controlled selected row keys: string[]|number[]
  selectedRowKeys: {
    type: Array,
    default: () => []
  },
  // Callback executed when selected rows change
  onChange: {
    type: Function,
    default: (selectedRowKeys, selectedRows) => {}
  },
  // Callback executed when select/deselect one row
  onSelect: {
    type: Function,
    default: (record, selected, selectedRows, nativeEvent) => {}
  }
}

export const expandable = {
  // The children's name
  childrenColumnName: {
    type: String,
    default: 'children' // string
  },

  // Indent size in pixels of tree data
  indentSize: {
    type: Number,
    default: 15 // must be Number
  },

  // Customize row expand Icon. Ref example
  expandIcon: Function, // (h, { prefixCls: string, expanded: boolean, expandable: boolean, record: object, onExpand: Function }) => VNode,

  // Customize row expand render.
  expandedRowRender: Function, // (h, { record: object, index: number, index: number, expanded: boolean }) => VNode,

  // Whether row can be expandable or not
  rowExpandable: Function, // (h) => boolean,

  // Current expanded row keys
  expandedRowKeys: {
    type: Array,
    default: () => [] // RowKey[]
  },

  // Current expanded deep into which depth
  expandedDepth: {
    type: Number,
    default: null // RowKey[]
  },

  // Expand all rows initially
  defaultExpandAllRows: {
    type: Boolean,
    default: true // boolean
  },

  // Callback executed when the row expand icon is clicked
  onExpand: Function, // (expanded, record) => {},

  // Callback executed when the expanded rows change
  onExpandedRowsChange: Function // (expandedRows) => {},
}

/**
 * API References
 * @see {@link https://ant.design/components/table/#components-table-demo-fixed-header}
 */
export const TableProps = {
  rowClassName: {
    type: [String, Function],
    default: ''
  },

  // fixed when header/columns are fixed, or using column.ellipsis
  tableLayout: {
    type: String,
    validator(val) {
      return ['auto', 'fixed'].includes(val)
    }
  },

  direction: {
    type: String,
    default: 'ltr',
    validator(val) {
      return ['ltr', 'rtl'].includes(val)
    }
  },

  // Whether to show all table borders
  bordered: BOOLEAN_FALSE_PROP,

  // Columns of table: ColumnProps[]
  columns: {
    type: Array,
    required: true
  },

  // Override default table elements
  components: {
    type: Object,
    default: () => TableComponents
  },

  // Data record array to be displayed
  dataSource: {
    type: Array,
    default: () => [],
    required: true
  },

  // expandable
  expandable: Object,

  // virtualization: Object,
  /* {
    // Whether to use virtualize scroll behavior
    useVirtual: BOOLEAN_FALSE_PROP,
    // The row height number of per row in TableBody
    rowHeight: { type: Number },
    // The row index where the position of view scroll to
    scrollToIndex: { type: Number, default: -1 },
  } */
  // Whether to use virtualize scroll behavior
  useVirtual: BOOLEAN_FALSE_PROP,
  // The row height number of per row in TableBody
  rowHeight: { type: Number },
  // The row index to specify where the view scroll to
  scrollToRow: { type: Number, default: -1 },

  prefixCls: {
    type: String,
    default: 'ant-table'
  },

  // Table footer renderer
  // Should it be slot?
  title: {
    type: [Function, Object]
  },

  // Table footer renderer
  // Should it be slot?
  footer: {
    type: [Function, Object]
  },

  rowKey: {
    type: [String, Function],
    required: true
  },

  rowSelection: Object,

  // { x: number | true, y: number }
  // x:	Set horizontal scrolling, can also be used to specify the width of the scroll area, could be number, percent value, true and 'max-content'	number | true	-
  // y:	Set vertical scrolling, can also be used to specify the height of the scroll area, could be number	number	-
  scroll: {
    type: Object,
    default: () => ({})
  },

  showHeader: BOOLEAN_TRUE_PROP,

  size: {
    type: String,
    default: 'default',
    validator(val) {
      return ['default', 'middle', 'small'].includes(val)
    }
  },

  locale: {
    type: Object,
    default: () => DEFAULT_LOCALE
  }
}

const LEFT = 'left'
const CENTER = 'center'
const RIGHT = 'right'

// ColumnProps
export const ColumnProps = {
  label: STRING_REQUIRED_PROP,
  prop: STRING_REQUIRED_PROP,
  key: STRING_REQUIRED_PROP,
  width: [String, Number],

  colspan: [Number, Function],
  rowspan: [Number, Function],
  className: [String, Function],

  fixed: {
    type: [Boolean, String],
    validator(val) {
      return [true, false, LEFT, RIGHT].includes(val)
    }
  },

  align: {
    type: String,
    validator(val) {
      return [LEFT, CENTER, RIGHT].includes(val)
    }
  },

  ellipsis: BOOLEAN_FALSE_PROP,
  expandable: BOOLEAN_FALSE_PROP,

  render: Function, // BodyRowCell Render: VNode|({ store: TableStore, row: RowModel, column: ColumnConfig }) => VNode
  renderHeader: Function, // HeaderRowCell Render: VNode|({ store, row, column }) => VNode

  // TODO
  resizable: BOOLEAN_FALSE_PROP
}
