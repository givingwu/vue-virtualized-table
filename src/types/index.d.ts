import { VNode } from "vue";

interface ColumnConfig {
  /* 列配置 */
  label?: string
  prop?: string
  key: string | number
  width: number | string /* % */
  render: (
    h: Function,
    param: ColumnParam
  ) => VNode | null /* must return a vnode instance */
  // filter(h: Function, param: ColumnParam)?: void; /* 暂未实现 */
  // sortBy(h: Function, param: ColumnParam)?: void; /* 暂未实现 */
}

interface ColumnParam {
  /* 列参数对象 */
  row: RowModel // 当前数据项 对应后端传入 list 的当前项的 model
  rows: Array<RowModel>
  index: number
  rowIndex: number
  column: ColumnConfig
  columnIndex: number
  store: TableStore
}

interface TableStore {
  isRowExpanded(row: RowModel): void /* 判断当前行是否是展开状态 */
  toggleRowExpansion(
    row: RowModel,
    expanded?: boolean
  ) /* 切换当前行展开收起状态 */
  isRowSelected(row: RowModel) /* 判断当前行是否选中状态 */
  toggleRowSelection(
    row: RowModel,
    selected?: boolean
  ) /* 切换当前行是否选中状态 */
  // filter /* 暂未实现 */
  // sortBy /* 暂未实现 */
}

interface TableProps {
}

type RowKey = number | string

interface RowModel {
  rowKey: RowKey /* [RowModel]rowKey 的值必须在 Array<RowModel> 中唯一 */
  children?: RowModel[]
  __parent?: RowModel | null /* 父节点 */
  __index: number
  __depth: number
  [prop as string]: any
}
