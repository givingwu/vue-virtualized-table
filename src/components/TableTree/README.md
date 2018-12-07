# Table-Tree
基于 element-ui 设计业特定的 `Table-Tree` 组件。


## Feature
1. 通过 column 每一列自定义 `render` 函数 + `TableStore` 暴露的各种方法来操作 table 的数据源 实现各种功能，解决了 element-ui 一列仅支持特定列 type 展示的问题。
2. 通过 Vue 实例的 computed 对象属性 tableData 返回 `TableStore.state.data`，解决了*组件数据源更新*导致*组件状态被更新*的问题。
3. 支持特定的 expand Depth，展开指定深度。

## Usage

### Props
props 大部分与 element-ui 的 table 类似。

主要存在以下不同：

#### Columns
用于映射列表中的数据。

> 代码并未使用 TypeScript 编写，下面仅仅用以表示类型所有使用了 TypeScript 的 interface。

- 需手动编写 `columns` `Array<ColumnConfig>`，ColumnConfig 数据结构如下：

| 字段名称              | 字段类型 | 必传   | 默认值      | description   |
| --------------------- | :------- | :----- | :---------- | :----- |
| label                 | string   | true   | -           | 当前列表头显示内容  |
| prop                  | string   | true   | -           | 当前列 server model 字段的 key |
| key                   | string   | number | - | 当前列 virtual-dom(v-for) 的 key |
| width                 | number   | false  | -           | 当前列的宽度  |
| render                | function | false  | `row[prop]` | 当前列的自定义 render 函数 => render(h, { depth: Number, expandDepth: Number, row: Row, rowIndex: Number, column: Column, columnIndex: Number, store: TableStore }) |
<!-- | filter **暂未实现** | function | false  | -         | 当前列的 filter 函数 => filter(...args) | -->
<!-- | sortBy **暂未实现** | function | false  | -         | 当前列的 sortBy 函数 => filter(...args) | -->


```ts
interface ColumnConfig { /* 列配置 */
  label?: string,
  prop: string,
  key: string | number,
  width: number | string/* % */,
  render(h: Function, param: ColumnParam)?: VNode, /* must return a vnode instance */
  // filter(h: Function, param: ColumnParam)?: void, /* 暂未实现 */
  // sortBy(h: Function, param: ColumnParam)?: void, /* 暂未实现 */
}

interface ColumnParam { /* 列参数对象 */
  depth: number,
  expandDepth: number,
  row: RowModel, // 当前数据项 对应后端传入 list 的当前项的 model
  rowIndex: number,
  column: ColumnConfig,
  columnIndex: number,
  store: TableStore,
}

interface TableStore {
  setState(state: TableState), /* 调用以更改当前 table 内部的状态*/
  isRowExpanded(row: RowModel): void, /* 判断当前行是否是展开状态 */
  toggleRowExpansion(row: RowModel, expanded?: boolean), /* 切换当前行展开收起状态 */
  // isRowSelected(row: RowModel)/* 暂未实现 */
  // toggleRowSelection(row: RowModel, selected?: boolean)/* 暂未实现 */
}

interface TableState {
  data: null | Array<RowModel>,
  columns: Array<ColumnConfig>,
  rowKey: String,
  selectedRowsKeys: Array<RowKey as string>, /* 已选中的 RowKeys */
  expandRows: Array<RowModel>, /* 已展开行 */
  expandRowKeys: Array<RowKey as string>, /* 已展开行的 RowKeys */
  defaultExpandAll: boolean, /* 默认是否展开所有 */
  // filter /* 暂未实现 */
  // sortBy /* 暂未实现 */
}

interface RowModel {
  [prop as string]: any /* 可传入任意属性任意值的数据 */
};
```

- 在自定义 render 的列里面调用展开 children 子元素 demo:

```jsx
const columns = [{
  label: null,
  prop: "_expand",
  key: 0,
  render: (h, { store, row, column, depth }) => {
    if (row.children && row.children.length) {
      const expanded = store.isRowExpanded(row); /* 调用 store.isRowExpanded 方法 */
      const classname = expanded ? "el-icon-minus" : "el-icon-plus";

      return (
        <i
          style={`padding-left: ${depth * 20}px`}
          class={classname}
          onClick={() => store.toggleRowExpansion(row)} /* 调用 store.toggleRowExpansion 方法 */
        />
      );
    } else {
      return '' // <ElCheckbox checked={store.isRowSelected(row)} onClick={() => store.toggleRowSelection(row)>; /* 暂未实现 => 如果希望在无 children 数据的情况下渲染 checkbox */
    }
  }
}]
```


## TODO

- 支持 expandDepth
- 支持 selectRowKeys
- 支持 列筛选 => column.filter(): void ?
- 支持 列排序 => Column ？
