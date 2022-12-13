# NOTE

Now there are many better products, more comprehensive maintenance, more powerful functions, and better data structures. We recommend you to use better virtual scrolling list projects:

+ [Surely Table](https://www.surely.cool) Commercially Watermarked, Vue V3
+ [vxetable](https://vxetable.cn) Non commercial, support Vue V2, V3

# Vue Virtualized Table

The second version of implementation of `vue-virtual-table` component, it was inspired from [rc-table](https://github.com/react-component/table) and [ant-table](https://ant.design/components/table), API design is 60%+ consistent. Or you could think I translated them from React to Vue and added *virtualize scroll* feature.


> **As time goes on, I think Vue2 has become obsolete, <font color="red">So I decided it is no longer maintained</font>.**

## Features
1. Support **customize render**
2. Support **virtualized scroll**
3. Support **expand/collapse**
4. Support **customize depth**

## Usage
Look the [Demo](https://givingwu.github.io/vue-virtualized-table) or run this project example in Terminal with npm:

```bash
npm install
npm run serve
```

Code example:
```js
import VirtualTable from 'vue-virtualized-table'
import 'vue-virtualized-table/src/table.css'

export default {
  render() {
    return (
      <VirtualTable
        row-key="id"
        scroll={{ y: 200 }}
        columns={columns}
        data-source={dataSource}
      />
    )
  }
}
```

## API

### props

#### TableProps
```js
{
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
  bordered: Boolean,

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
  expandable: Object, // See it below
  // Whether to use virtualize scroll behavior
  useVirtual: Boolean,
  // The row height number of per row in TableBody
  rowHeight: Number,
  // The row index to specify where the view scroll to
  scrollToRow: { type: Number, default: 0 },

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

  showHeader: {
    type: Boolean,
    default: true
  },

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
```

#### expandable
```js
{
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
}
```

#### rowSelection
```js
{
  type: {
    type: String,
    default: 'radio',
    validator(val) {
      return ['radio', 'checkbox'].includes(val)
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
```

#### ColumnProps
```js
{
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

  render: Function, // BodyRowCellRender: VNode|({ store: TableStore, row: RowModel, column: ColumnConfig }) => VNode
  renderHeader: Function, // HeaderRowCellRender: VNode|({ store, row, column }) => VNode

  // TODO
  resizable: BOOLEAN_FALSE_PROP
}
```

### TableStore
```js
isRowExpanded: (rowKey: string|RowModel) => boolean, // Whether current row/rowKey is expanded or not
toggleRowExpansion: (rowKey: string|RowModel, state: boolean => void, // To toggle current expansion state
toggleExpandAll: (expand: boolean) => void,// To toggle all rows be expanded
toggleExpandDepth: (depth: number) => void, // To toggle rows be expanded by specified depth number
isRowSelected: (rowKey: string|RowModel) => boolean, // Whether current row/rowKey is selected or not
toggleRowSelection: (rowKey: string|RowModel) => // To toggle current row selection state
```

### slots

|name|render|
|:--|:--|
|`empty`| When no-data so show empty block |
|`title`| The title panel slot |
|`footer`| The footer panel slot |

### events
|name|parameters|description|
|:--|:--|:--|
| select-change | `(record: RowModel, selected: boolean, selectedRowKeys: string[], nativeEvent: Event) => void` | When selection changed |
| expand-change | `(record: RowModel, isExpanded: boolean, expandedRowKeys: string[], nativeEvent: Event) => void` | When trigger expand or collapse|

## license
MIT
