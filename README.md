# Table-Tree
基于 element-ui CSS样式设计的 `Table-Tree` 组件。开放访问 `TableStore`方法，自定义扩展，自定义渲染。


## Feature
1. 通过 column 每一列自定义 `render` 函数 + `TableStore` 暴露的各种方法来操作 table 的数据源 实现各种功能，解决了 element-ui 一列仅支持特定的几个 type 展示的问题。
2. 通过 Vue 实例的 computed 对象属性 tableData 返回 `TableStore.state.data`，解决了*组件数据源更新*导致*组件状态被更新*的问题。
3. 支持特定的expand Depth，渲染指定深度的属性接口。


## Interfaces
```ts
interface ColumnConfig { /* 列配置 */
  label?: string;
  prop: string;
  key: string | number;
  width: number | string/* % */;
  render(h: Function, param: ColumnParam)?: VNode; /* must return a vnode instance */
  // filter(h: Function, param: ColumnParam)?: void; /* 暂未实现 */
  // sortBy(h: Function, param: ColumnParam)?: void; /* 暂未实现 */
}

interface ColumnParam { /* 列参数对象 */
  depth: number;
  expandDepth: number;
  row: RowModel; // 当前数据项 对应后端传入 list 的当前项的 model
  rowIndex: number;
  column: ColumnConfig;
  columnIndex: number;
  store: TableStore;
}

interface TableStore {
  setState(state: TableState); /* 调用以更改当前 table 内部的状态*/
  isRowExpanded(row: RowModel): void; /* 判断当前行是否是展开状态 */
  toggleRowExpansion(row: RowModel, expanded?: boolean); /* 切换当前行展开收起状态 */
  isRowSelected(row: RowModel);
  toggleRowSelection(row: RowModel, selected?: boolean);
}

interface TableState {
  data: null | Array<RowModel>;
  columns: Array<ColumnConfig>;
  rowKey: String;
  selectRows: Array<RowModel>; /* 已选中行 */
  expandRows: Array<RowModel>; /* 已展开行 */
  defaultExpandAll: boolean; /* 默认是否展开所有 */
  // filter /* 暂未实现 */
  // sortBy /* 暂未实现 */
}

interface RowModel {
  [rowKey as string]: number | string;
  [prop as string]: any; /* 可传入任意属性任意值的数据 */
};
```


## Usage
```html
<TableTreeDepth
  class="tree-table-view"
  :row-key="rowKey"
  :show-header="true"
  :data-source="TableData"
  :columns="columns"
  :expand-depth="1"
  :select-rows="[TableData[0].children[0], TableData[0].children[1]]"
/>
```

### Props
props 大部分与 element-ui 的 table 类似。有几点不同：

#### Columns
用于映射列表中的数据。

> 并未使用 TypeScript 编写，仅用以表示类型方便所以使用了 TypeScript 的 interface。

- 需手动编写 `columns` `Array<ColumnConfig>`，ColumnConfig 数据结构描述如下：

| 字段名称              | 字段类型 | 必传   | 默认值      | description   |
| --------------------- | :------- | :----- | :---------- | :----- |
| label                 | string   | true   | -           | 当前列表头显示内容  |
| prop                  | string   | true   | -           | 当前列 server model 字段的 key |
| key                   | string   | number | - | 当前列 virtual-dom(v-for) 的 key |
| width                 | number   | false  | -           | 当前列的宽度  |
| render                | function | false  | `row[prop]` | 当前列的自定义 render 函数 => render(h, { depth: Number, expandDepth: Number, row: Row, rowIndex: Number, column: Column, columnIndex: Number, store: TableStore }) |
| filter **暂未实现** | function | false  | -         | 当前列的 filter 函数 => filter(...args) |
| sortBy **暂未实现** | function | false  | -         | 当前列的 sortBy 函数 => filter(...args) |

##### Columns demo:
```jsx
const columns = [{
  label: '姓名',
  key: 'name',
}, {
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
      return (
        <el-checkbox
          style={`padding-left: ${depth * 20}px`}
          checked={checked}
          onChange={() => store.toggleRowSelection(row)}
        />
      )
    }
  }
}]
```

- className
- style
- header, 顶部元素
- footer, 底部元素
- expandDepth: number, 指定默认渲染的树的递归深度
- expandRows: Array<RowModel>, 指定默认递归展开的行
- selectRows: Array<RowModel>, 指定默认选中的行


## Events
| 事件名        | 说明	 | 参数   |
| ------------ | :----- | :----- |
| expand-change  | 当用户对某一行展开或者关闭的时候会触发该事件 | (row, expandRows) |
| select-change  | 当用户手动勾选数据行的 Checkbox 时触发的事件	 | (row, selectRows) |


## TODO

- [x] 支持 expandDepth
- [x] 支持 selectRows
- [ ] 支持 列筛选 => column.filter(): void ?
- [ ] 支持 列排序 => Column ？


## Run
```bash
npm i
```

```bash
npm run serve
```


## License
MIT