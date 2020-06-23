export const SIDE_EFFECTS = [
  'expandDepth',
  'expandedRowKeys',
  'defaultExpandAllRows',
  'rowSelectionType',
  'selectedRowKeys'
]

export const DEFAULT_COMPONENTS = {
  wrapper: 'div',
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
  },
  select: 'select',
  radio: 'radio',
  checkbox: 'checkbox',
  dropdown: 'select'
}

export const DEFAULT_LOCALE = {
  filterTitle: '过滤器',
  filterConfirm: '确定',
  filterReset: '重置',
  emptyText: '暂无数据',
  selectAll: '选择全部',
  selectInvert: '反选',
  sortTitle: '排序'
}

export const STYLE_WRAPPER = {
  position: 'relative'
}

export const STYLE_INNER = {
  position: 'relative',
  width: '100%',
  willChange: 'transform',
  WebkitOverflowScrolling: 'touch'
}
