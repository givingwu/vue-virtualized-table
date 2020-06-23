/* Forked from ant-design-vue */
import PropTypes from 'vue-types'
import { DEFAULT_LOCALE, DEFAULT_COMPONENTS } from './constants'

const LEFT = 'left'
const CENTER = 'center'
const RIGHT = 'right'

export const ColumnProps = {
  label: PropTypes.string.isRequired,
  prop: PropTypes.string.isRequired,
  key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  colSpan: PropTypes.number,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

  fixed: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf([LEFT, RIGHT])]),
  align: PropTypes.oneOf([LEFT, CENTER, RIGHT]),
  ellipsis: PropTypes.bool.def(false),

  renderHeader: PropTypes.func.def(null), // VNode|({ store, row, column }) => VNode

  sortable: PropTypes.bool.def(false), // TODO
  resizable: PropTypes.bool.def(false), // TODO
  expandable: PropTypes.bool.def(false)

  // TODO: filter
  // filterMultiple: PropTypes.bool,
  // filterDropdown: PropTypes.any,
  // filterDropdownVisible: PropTypes.bool,
  // filterIcon: PropTypes.any,
  // filteredValue: PropTypes.array,

  // TODO: sorter
  // sorter: PropTypes.oneOfType([PropTypes.boolean, PropTypes.func]),
  // defaultSortOrder: PropTypes.oneOf(['ascend', 'descend']),
  // sortOrder: PropTypes.oneOfType([
  //   PropTypes.bool,
  //   PropTypes.oneOf(['ascend', 'descend'])
  // ]),
  // sortDirections: PropTypes.array
}

export const Store = PropTypes.shape({
  setState: PropTypes.func.isRequired,
  getState: PropTypes.func.isRequired,
  subscribe: PropTypes.func.isRequired
})

export const TableComponents = PropTypes.shape({
  wrapper: PropTypes.string.def('table'),
  header: {
    wrapper: PropTypes.string.def('thead'),
    row: PropTypes.string.def('tr'),
    cell: PropTypes.string.def('th')
  },
  body: {
    wrapper: PropTypes.string.def('tbody'),
    row: PropTypes.string.def('tr'),
    cell: PropTypes.string.def('td')
  },

  // if use other UI framework, could instead of the following components
  // the select => ElSelect
  // the check-box => ElCheckBox
  // the radio => ElRadio
  // the scroll-bar => ElScrollbar
  select: PropTypes.string.def('select'),
  checkbox: PropTypes.string.def('checkbox'),
  radio: PropTypes.string.def('radio'),
  scrollbar: PropTypes.string
}).loose

export const TableLocale = PropTypes.shape({
  filterTitle: PropTypes.string.def('过滤器'),
  filterConfirm: PropTypes.any.def('确定'),
  filterReset: PropTypes.any.def('重置'),
  emptyText: PropTypes.any.def('暂无数据'),
  selectAll: PropTypes.any.def('选择全部'),
  selectInvert: PropTypes.any.def('反选'),
  sortTitle: PropTypes.string.def('排序')
}).loose

export const TableProps = {
  size: PropTypes.oneOf(['default', 'large', 'middle', 'small']).def('default'),
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  prefixCls: PropTypes.string.def('vc-table'),

  // Fixed Columns
  scroll: PropTypes.object.def({}),

  // Customize
  locale: TableLocale.def(DEFAULT_LOCALE),
  bordered: PropTypes.bool.def(false),
  bodyStyle: PropTypes.any,
  showHeader: PropTypes.bool.def(true),
  rowClassName: PropTypes.func, // (record: RowModel, index: number) => string
  components: TableComponents.def(DEFAULT_COMPONENTS),

  // virtual-scroll
  useVirtual: PropTypes.bool.def(true),
  rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  overscanCount: PropTypes.number.def(3),
  scrollToRowIndex: PropTypes.number.def(0),

  // Data
  columns: PropTypes.arrayOf(ColumnProps).isRequired,
  dataSource: PropTypes.array.isRequired,

  // Expandable
  indentSize: PropTypes.number.def(20),
  expandIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  expandDepth: PropTypes.number,
  expandedRowKeys: PropTypes.array,
  defaultExpandAllRows: PropTypes.bool,

  // Selection
  selectedRowKeys: PropTypes.array,
  rowSelectionType: PropTypes.oneOf(['checkbox', 'radio']),

  // Additional Part
  title: PropTypes.func,
  footer: PropTypes.func
}
